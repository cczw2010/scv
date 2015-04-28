/**
 * scv模板 模块
 */
var fs = require('fs');
var path = require('path');

// 模板的绝对路径
var tempRoot = path.dirname(fs.realpathSync(__filename)) + "/../template/";

// 拷贝模板，要求再空目录下执行
exports.copy = function(tempName,workPath) {
	// 检查当模板是否存在
	tempName = tempName||'default';
	var tempPath = tempRoot + tempName;
	var exits = fs.existsSync(tempPath);
	if (!exits) {
		console.log('[scv] 模板错误，请检查！');
		return;
	}
	// 拷贝模板初始化工程
	console.log("[scv] 拷贝模板:%s", tempName);
	copyDir(tempPath, workPath);
	console.log('[scv] success');
};

// 保存模板
exports.save = function(tempName,workPath){
	// 检查模板名称是否存在
	var tempPath = tempRoot + tempName;
	var exits = fs.existsSync(tempPath);
	if (exits) {
		console.log('[scv] 错误,模板名称已经存在！');
		return;
	}
	copyDir(workPath,tempPath);
	console.log('[scv] 模板保存成功！');
};

// 当前模板列表
exports.list = function(){
	fs.readdir(tempRoot, function(err, paths) {
		if (err) {
			throw err;
		}
		paths.forEach(function(path) {
			fs.stat(tempRoot+path,function(err,stat){
				if (!err && stat.isDirectory(path)) {
					console.log('> '+path);
				}
			});
			
		});
	})
};


/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
var copyDir = function(src, dst) {
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
};