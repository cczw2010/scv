// scv通用方法模块
// --------------------------------------
var fs = require('fs'); 
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
function delPath(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                delPath(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
// 判断是否工程目录,或者工程目录是否为空
function checkSCV(workPath){
  // 检查当目录是否为空
  var exits = fs.existsSync(workPath+'/gulpfile.js') && fs.existsSync(workPath+'/node_modules');
  if (exits) {
    return true;
  }
  return false;
}
//md5
function md5(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var pidfile = process.cwd()+'/scv.pid';
//保存当前目录的运行gulp服务进程pid
function savePid(pid){
	var fs = require('fs');
	fs.writeFileSync(pidfile,pid);
}
// 获取当前目录的运行gulp服务进程pid
function getPid(){
	var fs = require('fs');
	if (fs.existsSync(pidfile)) {
		return fs.readFileSync(pidfile, {encoding:'utf-8'});
	}else{
		return false;
	}
}

//公布属性
exports.workSpace = 'workspace';
exports.tmpSpace = 'tmp';
exports.revSpace = 'release';
exports.oneile = '.one';

//公布方法
exports.copyDir = copyDir;
exports.delPath = delPath;
exports.checkSCV = checkSCV;
exports.md5 = md5;
exports.savePid = savePid;
exports.getPid = getPid;

