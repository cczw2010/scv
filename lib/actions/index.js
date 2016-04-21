//文件操作任务集合

var path = require('path');
var sutil = require('../sutil');
var through = require('through2');
var vinyl = require('vinyl');
// 各类型的操作支持的操作情况如下
var supportTypes = ['html','js','css','other'];
var supportActions = {
	'concat':['html','js','css','other'],
	'hint':['css','js'],
	'compress':['js','html','css'],
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
var cocatInfo;
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
	var concatFiles = [];
  sutil.logline('->待合成文件:'+concatval,true);
	return through.obj(function(file,encoding,cb){
		if (!file || file.isStream()) {
      this.push(file);
      return cb();
    }
    sutil.logline(' 📄 file:'+(file.event||'check')+' '+file.relative,true);
    concatFiles.push(file);
    cb();
	},function(cb){
		var finalFile  = new vinyl({
									    path:concatval,
									    contents: new Buffer(0)
									  });

		concatFiles.forEach(function(file){
			finalFile.contents = Buffer.concat([finalFile.contents,file.contents]);
		});
    sutil.logline('->生成合并文件:'+concatval,true);
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
 * @return {boolean} through stream
 */
function fileAction(otype,actions){
	var procPath = './'+otype+'actions';
	try{
		var fileproc = require(procPath);
		return fileproc(actions);
	}catch(e){
		return noop();
	}
}
