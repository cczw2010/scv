/**
 * scv模板模块
 */
var fs = require('fs');
var path = require('path');
var scvutil = require('./scv-util.js');

// 模板的绝对路径
var tempRoot = path.dirname(fs.realpathSync(__filename)) + "/../template/";

// 拷贝模板，要求再空目录下执行
exports.copy = function(tempName,workPath) {
	// 检查当模板是否存在
	tempName = tempName||'default';
	var tempPath = tempRoot + tempName;
	var exits = fs.existsSync(tempPath);
	if (!exits) {
		console.log('[scv] 工程模板不存在！');
		return;
	}
	// 拷贝模板初始化工程
	console.log("[scv] 拷贝模板:%s", tempName);
	scvutil.copyDir(tempPath, workPath);
	console.log('[scv] success');
};
//删除模板
exports.del = function(tempName){
	if (tempName=='default') {
		console.log('[scv] default模板不允许删除！');
		return;
	}
	var tempPath = tempRoot + tempName;
	var exits = fs.existsSync(tempPath);
	if (!exits) {
		console.log('[scv] 工程模板不存在！');
		return;
	}
	console.log('[scv] 模板删除中...');
	scvutil.delDir(tempPath);
	console.log('[scv] sucess');
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
	console.log("[scv] 保存模板:%s", tempName);
	scvutil.copyDir(workPath+'/'+scvutil.tmpSpace,tempPath);
	console.log('[scv] success');
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
