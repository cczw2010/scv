/**
 * scv  release 命令
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const glob = require('glob');
const sutil = require('./sutil');
const through = require('through2');
const scv = require('./index');
const chalk = require('chalk');
const crypto = require('crypto');
const del = require('del');

const scvCfg = sutil.loadCfg();
let ver = '';

// 对外提供接口
module.exports = function(){
	// 获取当前目录的scv工程信息
	let spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.error('不是有效的scv工程目录,请先初始化:scv init [template name]');
		return;
	}

	if (typeof this.version == 'string') {
		ver = this.version;
	}
	// 显示发布的列表
	if (this.info) {
		sutil.log('scv release history:');
		let log = getLog();
		if (log) {
			console.log(log);
		}
		return;
	}

	// 默认发布命令
	sutil.log(`scv release-->${ver}:`);
	// 校验是否已经发布过该版本
	let releasePath = getVerPath();
	if (ver&&fs.existsSync(releasePath)) {
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
	let tasks = getActionsTasks(cfg);
	scv.task.startQueue(tasks);
	setLog();
}
/**
 * 获取处理Actions的任务数组
 * @param  {object} cfg 工程配置文件
 * @return {array}   返回任务数组
 */
function getActionsTasks(cfg){
	let procss = require('./actions');
	let tasks = [];
	let releasePath = getVerPath();

	// 处理所有的任务
	cfg.watchs.forEach(function(witem,i){
		let taskName = '_release_'+i;
		tasks.push(taskName);
    	let globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
		scv.task.add(taskName,function(cb){
			sutil.log('处理目录:',witem.paths,'类型:',witem.type);
			scv.src(globs,{cwd:cfg.workSpace,base:cfg.workSpace})
				.pipe(procss.filePreProcess())
				.pipe(procss.fileAction(witem.type,witem.actions))
				.pipe(procss.fileConcat(witem.actions.concat))
				.pipe(scv.dest(releasePath))
				.pipe(rev())
				.pipe(scv.dest(releasePath))
				.on('finish',cb);

		});
	});
	return tasks;
}

/**
 * 获取发布版本的信息log
 * @return {string}  log内容或者false
 */
function getLog(){
	let verPath = getVerPath();
	let verFile = path.join(verPath,'version');
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
function setLog(cnew){
	let verPath = getVerPath();
	let verFile = path.join(scvCfg.releaseSpace,'version');
	let flag = cnew?'w':'a';

	if (!fs.existsSync(verPath)) {
		fs.mkdirSync(verPath);
	}

	let log = `${new Date().toLocaleString()}\t${ver}\t ${os.hostname()}\\${os.platform()}\\${os.release()}\r\n`;
	fs.appendFile(verFile,log,{'flag':flag},function(err){
		if (err) {
			sutil.error('release log error:',err);
		}
	});
}

/**
 * 获取版本目录
 * @return {string}
 */
function getVerPath(){
	return path.join(scvCfg.releaseSpace,ver);
}


// 资源文件版本化处理
function rev(){
	return through.obj(function (file, enc, cb) {
		// console.log(file.relative,file.revno);
		// 生成md5版本号
		let md5 = crypto.createHash('md5');
		md5.update(file.revno, 'utf8');
		let revno = md5.digest('hex');

		let revname = `${file.stem}-${revno}`;
		// console.log(file.stem,revname,file.base,file.dirname);
		// 删除除了源文件之外的版本文件
		let globstr = path.join(file.dirname,`${file.stem}-*${file.extname}`);
		del.sync(globstr);
		// 重命名
	    file.stem = revname;
		// 删除旧版本信息
		// console.log(file.)
		cb(null,file);
	});
}