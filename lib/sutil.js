const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const chalk = require('chalk');
const anymatch = require('anymatch');

/**
 * 日志输出
 */
function logs(){
	log.apply(null,arguments);
}
// 错误
function logError(...params){
	process.stdout.write(chalk.red('x '));
	log.error.apply(null,params);
}
/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
function copyDir(src, dst) {
	// 读取目录中的所有文件/目录
	fs.readdir(src, function(err, paths) {
		if (err) {
			throw err;
		}
		// 判断目标目录是否存在，不存在就创建
		if (!fs.existsSync(dst)) {
			fs.mkdirSync(dst);
		}
		paths.forEach(function(path) {
			let _src = src + '/' + path,
				_dst = dst + '/' + path,
				readable, writable;

			fs.stat(_src, function(err, st) {
				if (err) {
					throw err;
				}
				// 判断是否为文件
				if (st.isFile() && path.indexOf('.') !== 0) {
					// 创建读取流
					readable = fs.createReadStream(_src);
					// 创建写入流
					writable = fs.createWriteStream(_dst);
					// 通过管道来传输流
					readable.pipe(writable);
				} else if (st.isDirectory()) {
					// 如果是目录则递归调用自身
					copyDir(_src, _dst);
				}
			});
		});
	});
}
// 删除文件夹
function delDir(path) {
  let files = [];
  if( fs.existsSync(path) ) {
      files = fs.readdirSync(path);
      files.forEach(function(file,index){
          let curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()) { // recurse
              delDir(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
  }
}

/**
 * 检查全局和本地scv版本
 * @param  {bool} islog 是否输出log,默认false
 * @return {bool}
 */
function checkVersion(islog){
	let cliscv =require(process.env.globalPath+'/lib/index');
	islog&&logs('Global CLI scv version ',cliscv.version);
	try{
		let localscv =require(process.env.localPath+'/lib/index');
		islog&&logs('Local scv version ',localscv.version);
	}catch(e){
		islog&&logs('当前工作目录没有安装scv,请先运行:npm install scv');
		return false;
	}
	return true;
}


let projectFile = process.cwd()+'/.scv';
/**
 * 初始化当前目录的scv工程信息 scv init 时
 * @param  {string} tempName 模板名称
 */
function initSPInfo(tempName){
	let cliscv =require(process.env.globalPath+'/lib/index');
	let info = {
		scvVersion : cliscv.version,
		tempName : tempName||'default'
	};
	fs.writeFileSync(projectFile,JSON.stringify(info));
}
/**
 * 获取当前目录的scv工程信息
 * @return {json object}
 */
function getSPInfo(){
	if (fs.existsSync(projectFile)) {
		return JSON.parse(fs.readFileSync(projectFile, {encoding:'utf-8'}));
	}else{
		return false;
	}
}

/**
 * 解析config.js配置文件对象中watchItem项,生成glob文件源字符串表达式
 * @param  {paths} paths watchItem中的paths
 * @param  {exts} exts watchItem中的exts
 * @param  {depth} exts watchItem中的depth
 * @return {array} 生成glob数组
 */
function resolveGlobs(paths,exts,depth){
	// paths  exts
	let ext = '*.+('+exts.join('|')+')';
	let globs = [];
	paths.forEach(function(p,i){
		let dep = depth?'**':'';
		globs[i] = path.join(p,dep,ext);
	});
	return globs;
}

/**
 * 加载配置文件,(缓存)
 * @return {object} config.js的配置json
 */
function loadCfg(){
	let configFile = path.join(process.cwd(),'config.js');
	let config =require(configFile);;
	config.tmpSpace = '.tmp';
	// console.log(config);
	return config;
}

/**
 * 封装promise，处理resolve和catch统一返回结果为[err,value]
 */
async function promiseWrap(p){
	return await p.then((vals)=>{
		return [null,vals];
	}).catch((err)=>{
		return [err];
	});
}

module.exports = {
	log:logs,
	error:logError,
	copyDir:copyDir,
	delDir:delDir,
	checkVersion:checkVersion,
	initSPInfo:initSPInfo,
	getSPInfo:getSPInfo,
	loadCfg:loadCfg,
	resolveGlobs:resolveGlobs,
	promiseWrap:promiseWrap,
}



