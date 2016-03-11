#!/usr/bin/env node
'use strict';

process.bin = process.title = 'Scv';

var fs = require('fs');
var path = require('path');
var program = require('commander');
var sutil = require('../lib/sutil');
var commTemplate = require('../lib/scv-template');
var commInit = require('../lib/scv-init');
var commHint = require('../lib/scv-hint');
var commRelease = require('../lib/scv-release');

// console.log(process);
//scv全局目录
process.env.globalPath = path.dirname(__dirname);
//当前工作目录的scv模块位置
process.env.localPath = path.join(process.env.PWD,'node_modules','scv');
//默认工程配置文件名
process.env.configPath = 'config.js';
//模板目录
process.env.tempPath = path.join(process.env.globalPath, "template");
// console.log(process.env.globalPath,process.env.localPath);

/***************命令行设置-start***************/
program
  .version('2.0.1')
  .usage('[options] 类似gulp的用法(-f,-t)\r\n\t scv command [options] 默认前端工程自动化用法,执行命令:scv [command] -h  可查看相关子命令的帮助');

// 类似gulp的使用方法
program
	.option('-f --scvfile <scvfile name>','类似gulp的使用方法,使用自定义的任务文件')
	.option('-t --task <task name>','如果指定了自定义scvfile任务文件,可以通过该参数指定要启动的任务名称,默认为default')
	.action(function(cmd){
		// console.log('*',arguments);
		console.log('无效命令:',cmd,' 查看帮助:scv -h');
		process.exit(0);
	});

/******SCV自定义服务 start********/
//SCV自定义服务-工程初始化
program.command('init [template]')
  .alias('I')
  .description('Scv前端工程自动化-初始化命令')
  // .option('-f, --force','强制初始化，如果目录不为空将清空')
  .action(commInit);

//SCV自定义服务-hint
program.command('hint')
  .alias('H')
  .description('Scv前端工程自动化-文件校验命令')
  .option('-o --otype [type name]','指定校验配置项中某类型的监控文件(css|js),不设置则为全部')
  .option('-w --watch','开启实时监控校验')
  .action(commHint);
  
//SCV自定义服务-release
program.command('release')
  .alias('R')
  .description('Scv前端工程自动化-发布相关命令(暂未重构完成)')
  .option('-l --list','显示已经发布的版本列表')
  .option('-i --info <release version>','显示已发布版本的资源文件版本日志')
  .action(commRelease);
//SCV自定义服务-template
program.command('template')
  .alias('T')
  .description('Scv前端工程自动化-模板命令')
  .option('-l --list','显示当前模板列表')
  .option('-d --delete <template name>','删除模板')
  .option('-s --save <template name>','将当前开发目录保存为模板')
  .action(commTemplate);
/******SCV自定义服务 end********/

// 解析命令行输入参数并执行
program.parse(process.argv);

// 类似gulp的用法,必须安装本地scv模块,引入任务文件和并执行任务
if (program.scvfile) {
	if (!sutil.checkVersion(true)) {
		return;
	}
	/******************自定义任务**********/
	// console.log(program.scvfile);
	if (program.scvfile===true) {
		sutil.log('请输入任务文件路径');
		return;
	}
	var scvfile = path.resolve(program.scvfile);
	if (!fs.existsSync(scvfile)) {
		sutil.log('任务文件不存在:'+scvfile);
		return;
	}
	sutil.log('导入指定任务文件:'+scvfile);
	require(scvfile);
	
	//判断要执行的任务,默认为default
	var runTask = 'default';
	// 如果指定了要执行的任务,则执行指定任务
	if (program.task && program.task!==true) {
		runTask = program.task;
	}
	// 执行默认或者指定任务
	process.nextTick(function(){
		var scv = require(process.env.localPath);
		if (!scv.task.hasTask(runTask)) {
			sutil.log('没有定义入口任务:'+runTask);
			return;
		}
		sutil.log('执行入口任务:'+runTask);
		scv.task.start(runTask);
	});
}
// 没有参数输出帮助
if (!process.argv.slice(2).length) {
	program.outputHelp();
}
/***************命令行设置-end***************/

// 退出处理
process.on('exit', function(code) {
	sutil.log('执行结束:',code);
});
