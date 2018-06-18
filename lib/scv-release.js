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
const procss = require('./actions');

let ver = '';
let scvCfg;

// 对外提供接口
module.exports = function(){
	scvCfg = sutil.loadCfg();
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
	let taskname = getActionsTasks(cfg);
	scv.task.start(taskname);
	setLog();
}
/**
 * 获取处理Actions的任务数组
 * @param  {object} cfg 工程配置文件
 * @return {array}   返回任务数组
 */
function getActionsTasks(cfg){
	let tasks = [];
	let releasePath = getVerPath();
	let _globs = [];
	// 处理所有的任务
	cfg.watchs.forEach(function(witem,i){
		let taskName = '_release_'+i;
		tasks.push(taskName);
    	let globs = sutil.resolveGlobs(witem.paths,witem.exts,witem.depth);
    	_globs = _globs.concat(globs);
		scv.task.add(taskName,function(cb){
			sutil.log('处理目录:',witem.paths,'类型:',witem.type);
			let actions = witem.actions||{};
			scv.src(globs,{cwd:cfg.workSpace,base:cfg.workSpace})
				.pipe(procss.filePreProcess())
				.pipe(procss.fileAction(witem.type,actions))
				.pipe(procss.fileConcat(actions.concat))
				.pipe(scv.dest(releasePath))
				.pipe(rev(witem.type))
				.on('finish',cb);

		});
	});
	let revTaskName = '_release_rev';
	// 版本化替换文件任务，在之前的任务之后执行
	scv.task.add(revTaskName,tasks,function(cb){
			sutil.log('版本化文件引用:->',releasePath);
			scv.src(_globs,{cwd:releasePath,base:releasePath})
				.pipe(revReplace())
				.pipe(scv.dest(releasePath))
				.on('finish',cb);
		});

	return revTaskName;
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

let manifests = [];
let mfiles = [];  //需要处理的文件列表
function rev(ftype){
	return through.obj(function (file, enc, cb) {
		// 需要更新版本号资源的内容文件
		if (ftype) {
			if(procss.supportActions.rev.indexOf(ftype)>-1){
				mfiles.push(file.relative);
			}
		}
		let str = file.contents.toString('utf-8');
		// 生成md5版本号， md5的10位足够了
		let revno = crypto.createHash('md5').update(str, 'utf8')
					.digest('hex').slice(0, 10);
		// console.log(file.relative,ftype,revno);
		//=======  1  重命名文件方式
		// let revname = `${file.stem}-${revno}`;
		// // 删除除了源文件之外的版本文件
		// let globstr = path.join(file.dirname,`${file.stem}-*${file.extname}`);
		// del.sync(globstr);
		// // 重命名
		// file.stem = revname;
	    //======= 2 加参数后缀方式
	    manifests.push({
	    	reg:new RegExp(file.relative, 'g'),
	    	replacement:file.relative+'?v='+revno
	    });
		cb(null,file);
	});
}
// 批量替换之前rev生成的映射表，单独弄个全量任务
function revReplace(){
	//替换文件中所有的url，因为js可以混写，html可以混写，所以不常规查找再替换了
	if(manifests.length==0 || mfiles.length==0){
		return procss.noop();
	}
	return through.obj(function(file,encoding,cb){
		if (mfiles.indexOf(file.relative)<0) {
			return cb(null,file);
		}
		let str = file.contents.toString('utf-8');
		manifests.forEach( function(r) {
			str = str.replace(r.reg,(val,idx)=>{
				return r.replacement;
				// console.log(idx,val,file.relative);
			});
		});
        file.contents = new Buffer(str);
		sutil.log(`->${file.relative}...✔`);
		cb(null,file);
	});
}