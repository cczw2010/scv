//文件操作任务集合

const path = require('path');
const sutil = require('../sutil');
const through = require('through2');
const vinyl = require('vinyl');

// 各类型的操作支持的操作情况如下
const supportTypes = ['html','js','css','image','other'];
const supportActions = {
	'concat':['html','js','css','other'],
	'hint':['css','js'],
	'compress':['js','html','css','image'],
	'prefix':['css'],
};


module.exports = {
	noop:noop,
	supportTypes:supportTypes,
	supportActions:supportActions,
	actionCheck:actionCheck,
	fileConcat:fileConcat,
	fileAction:fileAction
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

// 记录合并时所有的合并文件与目标文件,为后期html替换资源文件准备
let cocatInfo;
/**
 * 合并文件
 * @param {string} concatval 合并后的文件相对路径,actions里concat项
 * @return  through obj
 */
function fileConcat(concatval){
	if (!concatval) {
		return noop();
	}
	cocatInfo = [];	//初始化
	let concatFiles = [];
	return through.obj(function(file,encoding,cb){
			if (!file || file.isStream()) {
		      this.push(file);
		      return cb();
		    }
			sutil.log('\taction:concat...✔');
		    concatFiles.push(file);
		    cb();
		},function(cb){
			let fbuffer = new Buffer(0);
			concatFiles.forEach(function(file){
				fbuffer = Buffer.concat([fbuffer,file.contents]);
			});
			let finalFile  = new vinyl({
								    path:concatval,
								    contents: fbuffer
								  });
		    sutil.log('->生成合并文件:'+concatval);
			this.push(finalFile);
			cocatInfo.push({
				src:concatFiles,
				dest:concatval
			});
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
