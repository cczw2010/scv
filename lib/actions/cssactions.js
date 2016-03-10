/**
 * 提供css文件的相关流操作
 */
var path = require('path');
var sutil = require('../sutil');
var through = require('through2');
var vinyl = require('vinyl');

module.exports = cssActions;

/**
 * css类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function cssActions(actions){
	return through.obj(function (file, encoding, cb) {
    if (!file || file.isStream()) {
      this.push(file);
      return cb();
    }
    sutil.logline('📄 file:'+(file.event||'check')+' '+file.relative,true);

    var opStr = file.contents.toString();
    // 校验
		if (actions.hint) {
			sutil.logline(' -> action:hint...')
			var errs = cssHint(opStr,actions.hint);
			if (errs.length>0) {
				sutil.logline('×',true);
				errs.forEach(function(err){
					sutil.logline('->行数:'+err.line+'\t'+err.reason,true);
				});
        // return false;  终止流
			}else{
				sutil.logline('√',true);
			}
		}
		// prefix
		if (actions.prefix) {
			sutil.logline(' -> action:prefix...');
			var result = cssPrefix(opStr,actions.prefix);
			if (typeof result== 'string') {
				sutil.logline('√',true);
				opStr = result;
				file.contents = new Buffer(opStr,encoding);
			}else{
				sutil.logline('×',true);
				sutil.logline(' --> 错误:\t信息:'+result.message,true);
				return false;
			}
		}
		// 压缩
		if (actions.compress) {
			sutil.logline(' -> action:compress...')
			var result = cssCompress(opStr,actions.compress);
			if (typeof result== 'string') {
        sutil.logline('√',true);
        file.contents = new Buffer(result,encoding);
      }else{
        sutil.logline('×',true);
        if(Array.isArray(result)){
        	result.forEach(function(e){
        		sutil.logline(' --> 错误:\t信息:'+e.message,true);
        	});
        }
        // return false;  终止流
      }
		}
		this.push(file);
  	cb();
  	return;
  });
}
/**
 * css字符串的语法校验hint操作,使用css插件的hint方法
 * @param  {string} str  源码字符串
 * @param  {object} opt  css插件hint方法的配置参数,其中slient项恒为true
 * @return {[error]}
 */
function cssHint(str,opt){
	opt = typeof opt ==='object'?opt:{};
	opt.silent = true;

	var css = require('css');
	var ast = css.parse(str,opt);
	return ast.stylesheet.parsingErrors;
}

/**
 * css压缩操作
 * @param  {string} str	 要操作的样式字符串
 * @param  {object} opt  clean-css插件方法的配置参数
 * @return {string|Error} 压缩过的字符串,失败则错误数组  
 */
function cssCompress(str,opt){
	opt = typeof opt ==='object'?opt:{};
	try{
		// var css = require('css');
		// var ast = css.hint(str,{silent:true});
		// return css.stringify(ast,opt);
		var CleanCSS = require('clean-css');
 		var result = new CleanCSS(opt).minify(str);
 		if (result.errors.length==0) {
 			return result.styles;
 		}
 		return result.errors;
	}catch(e){
		return [e];
	}
	

}

/**
 * css3语法规则增加浏览器私有前缀
 * @param  {string]} str 源css字符串
 * @param  {string} opt autoprefixer插件的参数
 * @return {string|[error]}  
 */
function cssPrefix(str,opt){
	opt = typeof opt ==='object'?opt:{
								cascade: false,
								browsers:['last 10 version', 'safari 5','ie > 8', 'opera 12.1', 'ios 6', 'android 2.3']
                };

	var postcss = require('postcss');
	var autoprefixer = require('autoprefixer');
	try{
		var prefixer = postcss([ autoprefixer(opt)]);
		var result = prefixer.process(str);
		return result.css;
	}catch(e){
		return e;
	}
}