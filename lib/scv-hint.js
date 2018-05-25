/**
 * scv  server 命令
 */

const path = require('path');
const sutil = require('./sutil');
const scv = require('./index');

//加载配置文件
let proc = require('./actions');

module.exports = function(env,options){
	// 判断是否是初始化过得工程
	let spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.log('不是有效的scv工程目录,请先初始化:scv init [template name]');
	}
	let scvCfg = sutil.loadCfg();
	// console.log(this.watch);
  // console.log(this.otype);
	// 如果otype没有设置则选择所有支持hint的类型
	let otypes = [];
	let otype = this.otype;
	if (otype) {
		if (otype!==true) {
			if (proc.actionCheck(otype,'hint')) {
				otypes.push(otype);
			}else{
				sutil.log('不支持的类型:',otype);
				return;
			}
		}else{
			otypes = proc.supportActions.hint;
		}
	}else{
		//没有传入-o属性也选择全部支持hint的类型.
		otypes = proc.supportActions['hint'];
	}

	// scv.task.onAll(function(e){
	// 	console.log(e.src,e.task);
	// });
	// 执行校验任务
	let hintTasks = [];
	let watch = this.watch;
	scvCfg.watchs.forEach(function(witem,i){
		if (otypes.indexOf(witem.type)>-1) {
			let taskname = '_scvhint_'+i;
			hintTasks.push(taskname);

			let globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
			// console.log(taskname,globs);
			scv.task.add(taskname,task_hint(globs,witem,watch));
		}
	});
	sutil.log('Scv代码校验-->',otypes,':');
	scv.task.startQueue(hintTasks);
};


/**
 * hint任务实体
 * @param  {string} globs
 * @param  {object} option   配置
 * @param  {boolean} iswatch 是否实时监控
 * @return {array}     任务列表
 */
function task_hint(globs,option,iswatch){
	let scvCfg = sutil.loadCfg();
	if(iswatch){
		return function(){
			let watch = require('gulp-watch');
			watch(globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
				.pipe(proc.fileAction(option.type,option.actions))
				.pipe(scv.dest(scvCfg.releaseSpace))
				.on('end',function(){
					cb();
				});
		}
	}
	return function(cb){
		scv.src(globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
			.pipe(proc.fileAction(option.type,option.actions))
			.pipe(scv.dest(scvCfg.releaseSpace)) //dest触发end
			.on('end',function(){
				cb();
			});
	};
}