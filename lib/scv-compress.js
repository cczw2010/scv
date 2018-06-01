/**
 * scv  server 命令
 */

const path = require('path');
const sutil = require('./sutil');
const scv = require('./index');
const watch = require('gulp-watch');
const through = require('through2');
const anymatch = require('anymatch');
const chalk = require('chalk');

//加载配置文件
const proc = require('./actions');

module.exports = function(env,options){
	// 判断是否是初始化过得工程
	let spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.log('不是有效的scv工程目录,请先初始化:scv init [template name]');
	}
	let scvCfg = sutil.loadCfg();
	// console.log(this.watch);
  // console.log(this.otype);
	// 如果otype没有设置则选择所有支持compress的类型
	let otypes = [];
	let otype = this.otype;
	if (otype) {
		if (otype!==true) {
			if (proc.actionCheck(otype,'compress')) {
				otypes.push(otype);
			}else{
				sutil.log('不支持的类型:',otype);
				return;
			}
		}else{
			otypes = proc.supportActions.compress;
		}
	}else{
		//没有传入-o属性也选择全部支持compress的类型.
		otypes = proc.supportActions['compress'];
	}

	// scv.task.onAll(function(e){
	// 	console.log(e.src,e.task);
	// });
	// 执行压缩任务
	let _Tasks = [];
	let _Types = [];
	let _Globs = [];
	let _Opts = [];
	scvCfg.watchs.forEach((witem,i)=>{
		if (otypes.indexOf(witem.type)>-1  && witem.actions.compress) {
			let taskname = '_scvcompress_'+i;
			let globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
			// console.log(globs);
			let actionOpt = {compress:witem.actions.compress,concat:witem.actions.concat};
			_Types.push(witem.type);
			_Globs.push(globs);
			_Opts.push(actionOpt);
			// if (!this.watch) {
				_Tasks.push(taskname);
				scv.task.add(taskname,task_compress(globs,witem.type,actionOpt));
			// }
		}
	});
	sutil.log(`scv compress-->${_Types}:`);
	if(this.watch){
		scv.task.add('_scvcompress_watch', (cb)=>{
			let _globs = _Globs.reduce(function(pval,curval,curidx,result){
				return pval.concat(curval);
			}, []);
			let stream = watch(_globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
				.pipe(proc.filePreProcess())
				.pipe(through.obj(function (file, enc, cb) {
					// 检查所有符合的项目
					_Globs.forEach((globs,i)=>{
						if (anymatch(globs,file.relative)) {
							// console.log('match',_Types[i],file.relative,globs);
							// 判断是否需要合并
							if (_Opts[i].concat) {
								sutil.log('\t'+chalk.green('need redo concat, doing...'));
								cb();
								// 增加一个延时，因为可能是rename造成执行两次，但是start方法同一个任务同时执行两次只会实际执行一次
								// 延时是等rename的 unlink和add事件都执行完毕，语序错乱
								setTimeout(()=>{
									scv.task.start(_Tasks[i]);
								}, 500);
							}else{
								let funcProc = proc.fileAction(_Types[i],_Opts[i],false).bind(this);
								funcProc(file, enc, cb);
							}
						}
					});
				    // this.push(file);
				    // cb();
				   }))
				.pipe(scv.dest(scvCfg.releaseSpace))
				.on('finish',cb);
			// return stream;
		});
		// _Tasks.push('_scvcompress_watch');
		scv.task.start('_scvcompress_watch');
	}else{
		scv.task.startQueue(_Tasks);
	}
};

/**
 * compress任务实体
 * @param  {string} globs
 * @param  {string} ftype  文件类型
 * @param  {object} actionOpt   actions配置
 * @return {array}     任务列表
 */
function task_compress(globs,ftype,actionOpt){
	let scvCfg = sutil.loadCfg();
	return function(cb){
		scv.src(globs,{cwd:scvCfg.workSpace,base:scvCfg.workSpace})
			.pipe(proc.filePreProcess())
			.pipe(proc.fileAction(ftype,actionOpt))
			.pipe(proc.fileConcat(actionOpt.concat))
			.pipe(scv.dest(scvCfg.releaseSpace))
			.on('finish',cb);
	};
}