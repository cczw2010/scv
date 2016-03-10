/**
 * scv  release 命令
 */

var fs = require('fs');
var path = require('path');
var sutil = require('./sutil');
var through = require('through2');
var File = require('vinyl');

//加载配置文件
// console.log(scvCfg);
// 对外提供接口
module.exports = function(){
	// 获取当前目录的Scv工程信息
	var spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.log('不是有效的scv工程目录,请先初始化:scv init [template name]');
		return;
	}
	var scvCfg = sutil.loadCfg();
  // 列表
  // if (this.xxx) {
  // }
}
// var procss = require('./fileactions');
//     var watch = require('gulp-watch');
//     sutil.log('Scv实时文件监控服务启动...');
//     scvCfg.watchs.forEach(function(witem,i){
//       var globs = procss.resolveGlobs(witem.paths,witem.exts,witem.depth);
      
//       // sutil.log(globs);
//       var workcwd = path.join(process.cwd(),scvCfg.workSpace);
//       var taskname =  'watchtask'+i;
//       scv.task.add(taskname,function(cb){
//         // console.log(this);
//         watch(globs,{cwd:workcwd,base:workcwd})
//           .pipe(fileParse(witem.type,witem.actions.parser,workcwd));
//       });
//     });
//     scv.task.startQueue();
//     return;