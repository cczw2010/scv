exports.log = logs;
exports.logline = logline;
exports.checkSCV = checkSCV;
exports.copyDir = copyDir;
exports.delDir = delDir;
exports.checkVersion = checkVersion;
exports.initSPInfo = initSPInfo;
exports.getSPInfo = getSPInfo;
exports.loadCfg = loadCfg;
exports.resolveGlobs = resolveGlobs;
exports.setIndent = setIndent;

// var util = require('util');
var fs = require('fs');
var path = require('path');
var os = require('os');
var through = require('through2');
var eol = os.EOL;
var indentStr = '';

/**
 * 为之后的所有输出设置前置占位
 * @param  {string} str 占位的字符串表达式
 */
function setIndent(str){
	indentStr = str;
}

/**
 * 日志输出
 */
function logs(){
	process.stdout.write(indentStr);
	console.log.apply(null,arguments);
}


/**
 * 不换行显示log日志
 * @param  {string} msg  要显示的信息
 * @param  {boolean} endl 是否显示默认log头
 */
function logline(msg,endl){
	process.stdout.write(indentStr+msg);
	if (endl) {
		process.stdout.write(eol);
	}
}
/**
 * 检查当前目录是否有效的scv工程目录(scv init)
 * @return {boolean} 
 */
function checkSCV(){
	var status =  fs.statSync(process.env.PWD);
	console.log(status);
	// 检查当目录是否为空
  // var exits = fs.existsSync(path.join(process.env.PWD,'gulpfile.js')) && fs.existsSync(path.join(process.cwd(),'config.js'));
  // if (exits) {
  //   return true;
  // }
  // return false;
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
			var _src = src + '/' + path,
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
  var files = [];
  if( fs.existsSync(path) ) {
      files = fs.readdirSync(path);
      files.forEach(function(file,index){
          var curPath = path + "/" + file;
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
	var cliscv =require(process.env.globalPath);
	islog&&logs('Global CLI scv version ',cliscv.version);
	try{
		var localscv =require(process.env.localPath);
		islog&&logs('Local scv version ',localscv.version);
	}catch(e){
		islog&&logs('当前工作目录没有安装scv,请先运行:npm install scv');
		return false;
	}
	return true;
}


var projectFile = process.cwd()+'/scv';
/**
 * 初始化当前目录的scv工程信息 scv init 时
 * @param  {string} tempName 模板名称
 */
function initSPInfo(tempName){
	var cliscv =require(process.env.globalPath);
	var info = {
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
 * md5
 * @param  {string} str  要计算的字符串
 * @param  {int} size md5结果取值位数
 * @return {string}  md5字符串
 */
function calcMd5(str,size) {
  var crypto = require('crypto');
  var md5 = crypto.createHash('md5');
  md5.update(str, 'utf8');
  return size >0 ? md5.digest('hex').slice(0, size) : md5.digest('hex');
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
	var ext = '*.+('+exts.join('|')+')';
	var globs = [];
	paths.forEach(function(p,i){
		var dep = depth?'**':'';
		globs[i] = path.join(p,dep,ext);
	});
	return globs;
}
/**
 * 加载配置文件,(缓存)
 * @return {object} config.js的配置json
 */
function loadCfg(){
	var configFile = path.join(process.cwd(),'config.js');
	return require(configFile);
}
