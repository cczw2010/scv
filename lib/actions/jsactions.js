/**
 * 提供js文件相关流操作
 */
const path = require('path');
const sutil = require('../sutil');
const uglify = require('uglify-js');
const hint = require('jshint').JSHINT;

module.exports = jsActions;

/**
 * js类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function jsActions(actions){
  return function (file, encoding, cb) {
    if (!file || file.isStream()) {
       return cb(null,file);
    }
    sutil.log('->'+file.relative,(file.event||'check'));
    if (file.event=='unlink') {
      const cfg = sutil.loadCfg();
      del.sync(path.join(cfg.releaseSpace,file.relative));
        return cb(null,file);
    }

    let str = file.contents.toString();
    // 校验
    if (actions.hint) {
      let msg = '\taction:hint... ';
      let errs = jsHint(str,actions.hint);
      if (errs.length>0) {
        sutil.log(msg +'x')
        errs.forEach(function(err){
          if (err) {
            sutil.log('\terror no:'+err.line+'\tmsg:'+err.reason);
          }
        });
        // return false;  终止流
      }else{
        sutil.log(msg +'✔')
      }
    }
    // 压缩
    if (actions.compress) {
      let msg = '\taction:compress... ';
      let result = jsCompress(str,actions.compress);
      if (typeof result== 'string') {
        sutil.log(msg +'✔')
        file.contents = new Buffer(result,encoding);
      }else{
        sutil.log(msg +'x')
        sutil.log('\terror msg:'+result.message);
        // return false;  终止流
      }
    }
    cb(null,file);
  };
}

/**
 * js字符串的语法校验hint操作,使用jshint
 * @param  {string} str  源码字符串
 * @param  {object} opt  jshint的配置参数
 * @return {array}  错误数组
 */
function jsHint(str,opt){
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
  opt = typeof opt ==='object'?opt:{outSourceMap: false,compress:{unused:false}};
  try{
    opt.fromString = true;
    let result = uglify.minify(str,opt);
    return result.code;
  }catch(e){
    return e;
  }
}
