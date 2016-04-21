/**
 * 提供image文件的相关流操作
 */
var path = require('path');
var sutil = require('../sutil');
var through = require('through2');
var vinyl = require('vinyl');

module.exports = imageActions;

/**
 * image类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function imageActions(actions){
	return through.obj(function (file, encoding, cb) {
      this.push(file);
      return cb();
  });
}


/**
 * image压缩操作
 * @param  {buffer} buffer  要操作的buffer
 * @param  {object} opt  image-minifier插件的参数
 * @return {buffer|Error} buffer,失败则错误数组  
 */
function imageCompress(buffer,opt){
	return buffer;

	var filetype = require('file-type');
	//collapseWhitespace 去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
	opt = typeof opt ==='object'?opt:{};

	var result = filetype(buffer);
	switch(result.ext){
		case 'png':
			var proc = require('imagemin-optipng');
		break;
		case 'jpg':
			var proc = require('imagemin-jpegtran');
		break;
		case 'gif':
			var proc = require('imagemin-gifsicle');
		break;
		case 'svg':
			var proc = require('imagemin-svgo');
		break;
	}
	try{
	}catch(e){
		return e;
	}
}