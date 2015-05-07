/**
 * scv gulp 工程目录监控服务模块 
 */
var scvutil = require('./scv-util.js');
/**************对外提供接口*/
// 开始服务
exports.start=function(workPath){
	var pid = scvutil.getPid();
	if(pid){
		console.log('[scv] 服务已经启动，pid:'+pid);
		return;
	}
  console.log('[scv] 工程监控gulp服务启动中...');
	var spawn = require('child_process').spawn;
	var child = spawn('gulp',{
        detached : true,
        // stdio:['ignore', 'ignore', 'ignore']	//使用该选项则不占用当前控制台输出
        // stdio:['pipe', 'pipe', 'pipe']
    });
	scvutil.savePid(child.pid);
	// child.unref();
	
	child.stdout.on('data', function(data) {
	    console.log('[scv] ' + data);
	});
	child.on('exit', function(code,signal) {
	    console.log('[scv] exit:' + code+':'+signal);
	});
	child.on('error', function(err) {
	    console.log('[scv] error:' + err);
	});
	child.on('SIGINT', function() {
	    console.log('[scv] gulp SIGINT');
	});
};

// 当前状态
exports.info = function(){
	var pid =scvutil.getPid();
	if (pid) {
		console.log('[scv] 服务已经启动，pid:'+pid);
	}else{
		console.log('[scv] 	服务尚未启动');
	}
};

//停止服务
exports.stop = function(){
	var pid =scvutil.getPid();
	if (pid) {
		try{
			process.kill(pid, 'SIGINT');
			console.log('[scv] 服务已停止');
		}catch(err){
			console.log('[scv] 服务已经被异常终止');
		}
		scvutil.savePid('');
	}else{
		console.log('[scv] 服务尚未启动');
	}
};
// 发布版本
exports.release=function(revPath){
	var config = require(process.cwd()+'/config.js'),
		fs = require('fs'),
		ver = config.version,
		verPath = revPath+ver;
	if(fs.existsSync(verPath)){
		console.log('[scv] 版本号['+config.version+']已经发布过.请修改config.js文件中的版本号或者移除发布目录下的对应版本目录。');
		return;
	}

	// 创建目录，发布
	fs.mkdirSync(verPath);
	var spawn = require('child_process').spawn;
	var child = spawn('gulp',['release'],{
        detached : true,
        // stdio:['ignore', 'ignore', 'ignore']	//使用该选项则不占用当前控制台输出
        // stdio:['pipe', 'pipe', 'pipe']
    });
	child.stdout.on('data', function(data) {
	    console.log('[scv] ' + data);
	});

	child.on('exit', function(code,signal) {
		if (code==0) {
			if(fs.existsSync(verPath)){
	    	console.log('[scv] 版本['+ver+']发布成功！');
			}else{
	    	console.log('[scv] 版本['+ver+']发布失败！');
			}
		};
	});
	child.on('error', function(err) {
	  console.log('[scv] error:' + data);
	});
}


// 当前目录服务状态
exports.reStart = function(){
	this.stop();
	this.start();
};