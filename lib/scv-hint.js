/**
 * scv  server 命令
 */

var path = require('path');
var sutil = require('./sutil');
var scv = require('./index');

//加载配置文件
var proc = require('./actions');

module.exports = function(env,options){
	// 判断是否是初始化过得工程
	var spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.log('不是有效的scv工程目录,请先初始化:scv init [template name]');
	}
	var scvCfg = sutil.loadCfg();
	// console.log(this.watch);
  // console.log(this.otype);
	// 如果otype没有设置则选择所有支持hint的类型
	var otypes = [];
	var otype = this.otype;
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
	var hintTasks = [];
	var watch = this.watch;
	scvCfg.watchs.forEach(function(witem,i){
		if (otypes.indexOf(witem.type)>-1) {
			var taskname = '_scvhint_'+i;
			hintTasks.push(taskname);

			var globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
			// console.log(taskname,globs);
			scv.task.add(taskname,task_hint(globs,witem.type,watch));
		}
	});
	sutil.log('Scv代码校验-->',otypes,':');
	scv.task.startQueue(hintTasks);
};


/**
 * 校验任务
 * @param  {array} otypes 要校验的类型列表
 * @param  {array} watchs 配置文件中的watchs项
 * @param  {boolean} iswatch 是否实时监控
 * @return  task array
 */
function getHintTasks(otypes,watchs,iswatch){
	var tasks = [];
	watchs.forEach(function(witem,i){
		if (otypes.indexOf(witem.type)>-1) {
			var taskname = '_hint_'+i;
			tasks.push(taskname);

			var globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
			// console.log(taskname,globs);
			scv.task.add(taskname,task_hint(globs,witem.type,iswatch));
		}		
	});
	return tasks;
}

/**
 * hint任务实体
 * @param  {string} globs 
 * @param  {string} otype   类型
 * @param  {boolean} iswatch 是否实时监控
 * @return {array}     任务列表
 */
function task_hint(globs,otype,iswatch){
	var scvCfg = sutil.loadCfg();
	if(iswatch){
		return function(){
			var watch = require('gulp-watch');
			watch(globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
				.pipe(proc.fileAction(otype,{hint:true}))
				// .pipe(scv.dest(scvCfg.tmpSpace));
		}
	}
	return function(cb){
					scv.src(globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
						.pipe(proc.fileAction(otype,{hint:true}))
						.pipe(scv.dest(scvCfg.tmpSpace)) //dest触发end
						.on('end',function(){
							cb();
						});
				};
}