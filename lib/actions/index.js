//文件操作任务集合

const path = require('path');
const sutil = require('../sutil');
const through = require('through2');
const vinyl = require('vinyl');
const chalk = require('chalk');
const del = require('del');

// 各类型的操作支持的操作情况如下
const supportTypes = ['html','js','css','image','other'];
const supportActions = {
	'concat':['html','js','css','other'],
	'hint':['css','js'],
	'compress':['js','html','css','image'],
	'prefix':['css'],
	'rev':['html','js','css']
};
// gulp-watch | chokidar   监控事件列表
// const watchs = ['add','change','unlink','unlinkDir','error'];

module.exports = {
	noop:noop,
	supportTypes:supportTypes,
	supportActions:supportActions,
	actionCheck:actionCheck,
	fileConcat:fileConcat,
	fileAction:fileAction,
	filePreProcess:filePreProcess,
};

// process.on('unhandledRejection', error => {
//   // Will print "unhandledRejection err is not defined"
//   console.log('unhandledRejection', error.message);
// });

// 空的流方法
function noop(){
	return through.obj(function (file, encoding, cb) {
	    file&&this.push(file);
	    return cb();
		});
};


function typeCheck(otype){
	return supportTypes.indexOf(otype)>-1;
}
/**
 * 校验是否支持某类型或者某操作
 * @param  {string} otype  类型css|js|html...
 * @param  {string} action 操作 hint|compress...
 * @return {boolean} 
 */
function actionCheck(otype,action){
	return typeCheck(otype) && supportActions[action].indexOf(otype)>-1;
}

/**
 * 合并文件
 * @param {string} concatval 合并后的文件相对路径,actions里concat项
 * @return  through obj
 */
function fileConcat(concatval){
	if (!concatval) {
		return noop();
	}
	let concatFiles = [];
	return through.obj(function(file,encoding,cb){
			if (!file || file.isStream()) {
		      this.push(file);
		      return cb();
		    }
			sutil.log(`\taction: ${chalk.green('concat...')}`);
		    concatFiles.push(file);
		    // 不往下执行了
		    cb();
		},function(cb){
			let fbuffer = new Buffer(0);
			concatFiles.forEach((file)=>{
				fbuffer = Buffer.concat([fbuffer,file.contents]);
			});
			let finalFile  = new vinyl({
								    path:concatval,
								    contents: fbuffer
								  });
		    sutil.log(`=>${chalk.green('concat to file:')}${concatval}...✔`);
		    // 组合版本号
			// finalFile.revno = revnos.join('');
			this.push(finalFile);
			cb();
	});
}

/**
 * 文件操作, concat除外
 * @param  {string} otype 操作类型 js|css|html|image|other
 * @param  {object} actions
 * @param  {isstream} 是否返回stream，否则直接返回流内的处理函数
 * @return {boolean} stream|through func(no stream)
 */
function fileAction(otype,actions,isstream=true){
	let procPath = './'+otype+'actions';
	try{
		let fileproc = require(procPath)(actions);
		if (isstream) {
			return through.obj(fileproc);
		}else{
			return fileproc;
		}
	}catch(e){
		sutil.log(e);
		return noop();
	}
}

/**
 * 文件预处理，删除，文件夹操作等
 */
function filePreProcess(){
	const cfg = sutil.loadCfg();
	return through.obj(function(file, encoding, cb){
		if (!file || file.isStream()) {
	       return cb(null,file);
	    }
	    // 图片处理是异步的promise 所以这里不显示，在图片处理内部自己处理，防止log顺序错乱
	    if (!isPic(file.extname)) {
	    	sutil.log('->'+file.relative,(file.event||'check'));
	    }

	    switch (file.event) {
	    	case 'unlinkDir':
	    		// doing 默认的watch并不监控unlinkDir事件，这里也先不处理删除目录事件
	    		break;
	    	case 'unlink':
	      		del.sync(path.join(cfg.releaseSpace,file.relative));
	    	default:
	    		break;
	    }

	    return cb(null,file);
	});
}

// 根据后缀判断是否图片 jpg,gif,png,jpeg
function isPic(ext){
	return /(jpg|gif|png|jpeg)$/.test(ext.toLowerCase());
}
