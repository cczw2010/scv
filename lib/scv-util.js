// scv通用方法模块
// --------------------------------------
var fs = require('fs');
var path = require('path');
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
// 判断是否工程目录,或者工程目录是否为空
function checkSCV(){
  // 检查当目录是否为空
  var exits = fs.existsSync(path.join(process.cwd(),'gulpfile.js')) && fs.existsSync(path.join(process.cwd(),'config.js'));
  if (exits) {
    return true;
  }
  return false;
}

var pidfile = process.cwd()+'/scv.pid';
//保存当前目录的运行gulp服务进程pid
function savePid(pid){
	fs.writeFileSync(pidfile,pid);
}
// 获取当前目录的运行gulp服务进程pid
function getPid(){
	if (fs.existsSync(pidfile)) {
		return fs.readFileSync(pidfile, {encoding:'utf-8'});
	}else{
		return false;
	}
}
// 写文件日志
function log(file,data){
	var os = require('os');
	data = data+os.EOL;
	fs.writeFile(file, data,{
		flag:'a+'
	},function(err){
		if (err) {
			throw err;
		}
	});
}
//公布属性
exports.workSpace = 'workspace';
exports.tmpSpace = 'tmp';
exports.revSpace = 'release';
exports.oneFile = 'scv.one';
exports.logFile = 'log.txt';

//公布方法
exports.copyDir = copyDir;
exports.delDir = delDir;
exports.checkSCV = checkSCV;
exports.savePid = savePid;
exports.getPid = getPid;
exports.log = log;

