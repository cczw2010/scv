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
	child.stderr.on('data', function(data) {
	    console.log('[scv] error:' + data);
	});
	child.on('exit', function(code,signal) {
	    console.log('[scv] exit:' + code+':'+signal);
	});
	child.on('close', function(code,signal) {
	    console.log('[scv] close:' + code+':'+signal);
	});
	child.on('SIGINT', function() {
	    console.log('[scv] gulp SIGINT');
	});
	child.on('message', function(m) {
	    console.log('[scv] child got message:'+m);
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

// 当前目录服务状态
exports.reStart = function(){
	this.stop();
	this.start();
};