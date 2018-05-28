/**
 * scv  server 命令
 */

const path = require('path');
const sutil = require('./sutil');
const scv = require('./index');
const watch = require('gulp-watch');
const through = require('through2');
const anymatch = require('anymatch');

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
	let _Tasks = [];
	let _Types = [];
	let _Globs = [];
	let _Opts = [];
	scvCfg.watchs.forEach((witem,i)=>{
		if (otypes.indexOf(witem.type)>-1 && witem.actions.hint) {
			let taskname = '_scvhint_'+i;
			let globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
			let actionOpt = {hint:witem.actions.hint};
			_Types.push(witem.type);
			_Globs.push(globs);
			_Opts.push(actionOpt);
			if (!this.watch) {
				_Tasks.push(taskname);
				scv.task.add(taskname,task_hint(globs,witem.type,actionOpt));
			}
		}
	});
	sutil.log(`scv hint-->${_Types}:`);
	if(this.watch){
		// console.log(_Globs);
		scv.task.add('_scvhint_watch', (cb)=>{
			let _globs = _Globs.reduce(function(pval,curval,curidx,result){
				return pval.concat(curval);
			}, []);
			let funcProc = null;  //
			let stream = watch(_globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
				.pipe(proc.filePreCheck())
				.pipe(through.obj(function (file, enc, cb) {
					// 检查所有符合的项目
					_Globs.forEach((globs,i)=>{
						if (anymatch(globs,file.relative)) {
							// console.log('match',_Types[i],file.relative,globs);
							funcProc = proc.fileAction(_Types[i],_Opts[i],false).bind(this);
							funcProc(file, enc, cb);
						}
					});
				    // this.push(file);
				    // cb();
				   }));
			stream.pipe(scv.dest(scvCfg.releaseSpace)).on('end',cb);
			// return stream;
		});
		_Tasks.push('_scvhint_watch');
	}
	scv.task.startQueue(_Tasks);
};


/**
 * hint任务实体
 * @param  {string} globs
 * @param  {string} ftype  文件类型
 * @param  {object} actionOpt   actions配置
 * @return {array}     任务列表
 */
function task_hint(globs,ftype,actionOpt){
	let scvCfg = sutil.loadCfg();
	return function(cb){
		scv.src(globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
			.pipe(proc.fileAction(ftype,actionOpt))
			.pipe(scv.dest(scvCfg.tmpSpace)) //dest触发end
			.on('end',cb);
	};
}