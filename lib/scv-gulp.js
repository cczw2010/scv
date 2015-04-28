/**
 * scv gulp 工程目录监控工具 
 */

/**************对外提供接口*/
// 开始服务
exports.start=function(workPath,scvPath){
	var pid = getPid();
	if(pid){
		console.log('[scv] 服务已经启动，pid:'+pid);
		return;
	}
  console.log('[scv] 工程监控gulp服务启动中...');
	
	var spawn = require('child_process').spawn;
	var fs = require('fs');
	var child = spawn('gulp',{
        detached : true,
        stdio:['ignore', 'ignore', 'ignore']
        // stdio:['pipe', 'pipe', 'pipe']
    });
	child.unref();

	child.on('data', function(data) {
	    console.log('[scv] ' + data);
	});
	savePid(child.pid);
  console.log('[scv] 启动成功');
};

// 当前状态
exports.info = function(){
	var pid =getPid();
	if (pid) {
		console.log('[scv] 服务已经启动，pid:'+pid);
	}else{
		console.log('[scv] 	服务尚未启动');
	}
};

//停止服务
exports.stop = function(){
	var pid =getPid();
	if (pid) {
		try{
			process.kill(pid, 'SIGHUP');
			console.log('[scv] 服务注销成功');
		}catch(err){
			console.log('[scv] 服务已经被异常终止');
		}
		savePid('');
	}else{
		console.log('[scv] 服务尚未启动');
	}
};

// 当前目录服务状态
exports.reStart = function(){
	this.stop();
	this.start();
};


//////////
var pidfile = process.cwd()+'/scv.pid';
//保存当前目录的运行gulp服务进程pid
var savePid = function(pid){
	var fs = require('fs');
	fs.writeFileSync(pidfile,pid);
};
// 获取当前目录的运行gulp服务进程pid
var getPid = function(){
	var fs = require('fs');
	if (fs.existsSync(pidfile)) {
		return fs.readFileSync(pidfile, {encoding:'utf-8'});
	}else{
		return false;
	}
};