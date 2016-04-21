/**
 * scv  release 命令
 */

var fs = require('fs');
var os = require('os');
var path = require('path');
var sutil = require('./sutil');
var through = require('through2');
var scv = require('../index');

// 对外提供接口
module.exports = function(){
	// 获取当前目录的Scv工程信息
	var spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.log('不是有效的scv工程目录,请先初始化:scv init [template name]');
		return;
	}

	var scvCfg = sutil.loadCfg();
	
  // 显示发布的列表
  if (this.list) {
  	sutil.log('Scv工程已发布版本列表:');
  	fs.readdir(scvCfg.releaseSpace,function(err,files){
  		files.forEach(function(f,i){
  			var p = path.join(scvCfg.releaseSpace,f);
				fs.stat(p, function (err, stats) {
				  if (!err && stats.isDirectory()) {
				  	sutil.log(f);
				  }
				});
  		});
  	});
  	return;
  }
  // 显示发布的列表
  if (this.info) {
  	var ver = this.info===true?scvCfg.version:this.info;
  	sutil.log('Scv版本发布信息:',ver);
  	var log = getVerLog(ver);
  	if (log) {
  		sutil.log(log);
  	}else{
  		sutil.log('未发现相关版本信息');
  	}
  	return;
  }

  // 默认发布命令
	sutil.log('Scv发布版本-->',scvCfg.version,':');
	sutil.setIndent('  ');
	// 校验是否已经发布过该版本
	var releasePath = getVerPath();
	if (fs.existsSync(releasePath)) {
		process.stdout.write('当前版本已经存在,是否覆盖(y/n)?');
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(chunk) {
		  process.stdin.end();
		  if (chunk === null || chunk.toLowerCase().charAt(0)!="y") {
		  	return;
		  }
  		release(scvCfg);
		});
	}else{
  	release(scvCfg);
	}
	return;
}

/** 发布 */
function release(cfg){
	var tasks = getActionsTasks(cfg);
	scv.task.startQueue(tasks);
	setVerLog(cfg.version,'发布版本');
}
/**
 * 获取处理Actions的任务数组
 * @param  {object} cfg 工程配置文件
 * @return {array}   返回任务数组
 */
function getActionsTasks(cfg){
	var procss = require(	'./actions');
	var tasks = [];
	var releasePath = getVerPath();
	
	cfg.watchs.forEach(function(witem,i){
		var taskName = '_release_'+i;
		tasks.push(taskName);
    var globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
		scv.task.add(taskName,function(cb){
			sutil.log('处理目录:',witem.paths,'类型:',witem.type);
			scv.src(globs,{cwd:cfg.workSpace,base:cfg.workSpace})
				.pipe(procss.fileAction(witem.type,witem.actions))
				.pipe(scv.dest(releasePath)) //dest触发end
				.on('end',function(){
									cb();
								});

		});
	});
	return tasks;
}

/**
 * 获取发布版本的信息log
 * @param  {string} ver 发布版本标示
 * @return {string}  log内容或者false 
 */
function getVerLog(ver){
	var verPath = getVerPath(ver);
	var verFile = path.join(verPath,'version');
	if (fs.existsSync(verFile)) {
		return fs.readFileSync(verFile, {encoding:'utf-8'});
	}else{
		return false;
	}
}

/**
 * 书写版本log日志
 * @param {string} ver 版本
 * @param {string} log 信息
 * @param {boolean} cnew 是否生成新的文件,文件存在则删除
 */
function setVerLog(ver,log,cnew){
	var verPath = getVerPath(ver);
	var verFile = path.join(verPath,'version');
	var dt = new Date().toLocaleString();
	var flag = cnew?'w':'a';

	if (!fs.existsSync(verPath)) {
		fs.mkdirSync(verPath);
	}

	fs.appendFile(verFile,dt+'\t'+log+'\t '+os.hostname()+'\\'+os.platform()+'\\'+os.release()+'\r\n',{'flag':flag},function(err){
		if (err) {
			sutil.log('release log日志记录操作',err);
		}
	});
}

/**
 * 获取版本目录
 * @param  {string} ver 版本号,不传则为当前版本目录
 * @return {string}    
 */
function getVerPath(ver){
	var scvCfg = sutil.loadCfg();
	ver = ver||scvCfg.version;
	return path.join(scvCfg.releaseSpace,ver);
}