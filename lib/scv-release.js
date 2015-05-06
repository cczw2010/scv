/**
 * scv 发布版本模块
 */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var scvutil = require('crypto');
var revPath = process.cwd()+'/'+scvutil.revSpace+'/';



/**************对外提供接口*/
// 版本列表
exports.list=function(){
	fs.readdir(revPath, function(err, paths) {
		if (err) {
			throw err;
		}
		paths.forEach(function(path) {
			fs.stat(relPath+path,function(err,stat){
				if (!err && stat.isDirectory(path)) {
					console.log('> '+path);
				}
			});
			
		});
	})
};

// 发布版本
exports.release=function(scvPath){
	var config = require(process.cwd()+'/config.js');
	var verPath = revPath+ver;
	if(fs.existsSync(verPath)(config.version)){
		console.log('[scv] 版本号['+config.version+']已经发布过.请修改config.js文件中的版本号或者移除发布目录下的对应版本目录。');
		return;
	}

	var spawn = require('child_process').spawn;
	var child = spawn('gulp',['release'],{
        detached : true,
        // stdio:['ignore', 'ignore', 'ignore']	//使用该选项则不占用当前控制台输出
        // stdio:['pipe', 'pipe', 'pipe']
    });
	child.stdout.on('data', function(data) {
	    console.log('[scv] ' + data);
	});
	child.stderr.on('data', function(data) {
	    console.log('[scv] error:' + data);
	});
}
