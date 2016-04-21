/**
 * 提供js文件相关流操作
 */
var path = require('path');
var sutil = require('../sutil');
var through = require('through2');
var vinyl = require('vinyl');

module.exports = jsActions;

/**
 * js类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function jsActions(actions){
  return through.obj(function (file, encoding, cb) {

    if (!file || file.isStream()) {
      this.push(file);
      return cb();
    }
    sutil.logline('📄 file:'+(file.event||'check')+' '+file.relative,true);

    var str = file.contents.toString();
    // 校验
    if (actions.hint) {
      sutil.logline(' -> action:hint...')
      var errs = jsHint(str,actions.hint);
      if (errs.length>0) {
        sutil.logline('×',true);
        errs.forEach(function(err){
          if (err) {
            sutil.logline(' --> 行数:'+err.line+'\t'+err.reason,true);
          }
        });
        // return false;  终止流
      }else{
        sutil.logline('√',true);
      }
    }
    // 压缩
    if (actions.compress) {
      sutil.logline(' -> action:compress...')
      var result = jsCompress(str,actions.compress);
      if (typeof result== 'string') {
        sutil.logline('√',true);
        file.contents = new Buffer(result,encoding);
      }else{
        sutil.logline('×',true);
        sutil.logline(' --> 错误:\t信息:'+result.message,true);
        // return false;  终止流
      }
    }
    this.push(file);
    cb();
    return;
  });
}

/**
 * js字符串的语法校验hint操作,使用jshint
 * @param  {string} str  源码字符串
 * @param  {object} opt  jshint的配置参数
 * @return {array}  错误数组
 */
function jsHint(str,opt){
  var hint = require('jshint').JSHINT;
  opt = typeof opt ==='object'?opt:{};
  hint(str,opt);
  return hint.errors;
}

/**
 * js压缩操作
 * @param  {string} str  源码字符串
 * @param  {object} opt  uglify-js的参数
 * @return {string|Error} 压缩过的字符串,失败则错误数组  
 */
function jsCompress(str,opt){
  var uglify = require('uglify-js');
  opt = typeof opt ==='object'?opt:{outSourceMap: false,compress:{unused:false}};
  try{
    opt.fromString = true;
    var result = uglify.minify(str,opt);
    return result.code;
  }catch(e){
    return e;
  }
}
