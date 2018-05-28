/**
 * 提供html文件的相关流操作
 */
const path = require('path');
const sutil = require('../sutil');
const minify = require('html-minifier').minify;

module.exports = htmlActions;

/**
 * html类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function htmlActions(actions){
	return function (file, encoding, cb) {
    if (!file || file.isStream()) {
      this.push(file);
      return cb();
    }
	// 压缩
	if (actions.compress) {
		htmlCompress(file,actions.compress);
	}
	// 不合并的话就将文件流向下一个操作
	this.push(file);
  	cb();
  };
}


/**
 * html压缩操作
 * @param  {vinyl} file   操作的文件
 * @param  {object} opt  html-minifier插件的参数
 * @return {string|Error} 压缩过的字符串,失败则错误数组  
 */
function htmlCompress(file,opt){
	sutil.log('->'+file.relative);
    let msg = '\taction:compress...';
	opt = typeof opt ==='object'?opt:{
			//collapseWhitespace 去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
			collapseWhitespace: true,
			removeComments: true,
			minifyJS:true,
			minifyCSS:true,
			relateurl:true};
	try{
		let result = minify(file.contents.toString(),opt);
	    sutil.log(msg+'✔');
	    file.contents = new Buffer(result);
	    return true;
	}catch(e){
	    sutil.log(msg+'×');
	    sutil.log('\terror msg:'+e.message);
		return false;
	}
}