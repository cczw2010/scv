/**
 * 提供html文件的相关流操作
 */
var path = require('path');
var sutil = require('../sutil');
var through = require('through2');
var vinyl = require('vinyl');

module.exports = htmlActions;

/**
 * html类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function htmlActions(actions){
	return through.obj(function (file, encoding, cb) {
    if (!file || file.isStream()) {
      this.push(file);
      return cb();
    }
    sutil.logline('📄 file:'+(file.event||'check')+' '+file.relative,true);
		// 压缩
		if (actions.compress) {
			htmlCompress(file,actions.compress);
		}
		// 不合并的话就将文件流向下一个操作
		this.push(file);
  	cb();
  });
}


/**
 * html压缩操作
 * @param  {vinyl} file   操作的文件
 * @param  {object} opt  html-minifier插件的参数
 * @return {string|Error} 压缩过的字符串,失败则错误数组  
 */
function htmlCompress(file,opt){
	sutil.logline(' -> action:compress...');

	opt = typeof opt ==='object'?opt:{
			//collapseWhitespace 去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
			collapseWhitespace: true,
			removeComments: true,
			minifyJS:true,
			minifyCSS:true,
			relateurl:true};
	var minify = require('html-minifier').minify;
	try{
		var result = minify(file.contents.toString(),opt);
    sutil.logline('√',true);
    file.contents = new Buffer(result);
    return true;
	}catch(e){
    sutil.logline('×',true);
    sutil.logline(' --> 错误:\t信息:'+e.message,true);
		return false;
	}
}