var gulp = require('gulp'); 
var fs = require('fs'); 
var path = require('path');
var scvutil = require('./scv-util.js');

var gutil = require('gulp-util');
var through = require('through2');
var combiner = require('stream-combiner2');
var Concat = require('concat-with-sourcemaps');
var changed = require('gulp-changed');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var minifyCSS = require('gulp-minify-css');
var autofixer = require('gulp-autoprefixer');

var imagemin = require('gulp-imagemin');
// var imgcache = require('gulp-cache');
// 
var htmlmin = require('gulp-htmlmin');

var connect = require('gulp-connect'); // run a webserver (with LiveReload)

// 目录，配置
var config = require(process.cwd()+'/config.js');

// 资源相对目录
var jsPath = 'assets/js';
var cssPath = 'assets/css';
var imagePath = 'assets/image';
var htmlPath = 'html';
// 监控
var jsWatch = scvutil.workSpace+'/'+jsPath+'/**/*.js';
var cssWatch = scvutil.workSpace+'/'+cssPath+'/**/*.css';
var imageWatch = scvutil.workSpace+'/'+imagePath+'/**/*.*';
var htmlWatch = scvutil.workSpace+'/'+htmlPath+'/**/*.html';

/***********************************gulp任务*/
// 常规任务
gulp.task('js', function() {
  var combined = combiner.obj([
      gulp.src(jsWatch),
      changed(scvutil.tmpSpace+'/'+jsPath,{extension: '.js'}),
      jshint(),
      scvconcat({suffix:'js'}),
      uglify({outSourceMap: false}),
      gulp.dest(scvutil.tmpSpace+'/'+jsPath)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
    // console.log(err);
    // console.error('js error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;
});
gulp.task('css', function() {
  var combined = combiner.obj([
      gulp.src(cssWatch),
      changed(scvutil.tmpSpace+'/'+cssPath,{extension: '.css'}),
      autofixer({
                // browsers: ['> 1%','last 5 versions','Firefox ESR','Opera 12.1'],
                browsers:['last 10 version', 'safari 5','ie>9', 'opera 12.1', 'ios 6', 'android 2.3'],
                cascade: false
            }),
      scvconcat({suffix:'css'}),
      minifyCSS({'removeEmpty':true}),
      gulp.dest(scvutil.tmpSpace+'/'+cssPath)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
  //   console.error('css error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;
});
gulp.task('image', function() {
  var combined = combiner.obj([
      gulp.src(imageWatch),
      changed(scvutil.tmpSpace+'/'+imagePath),
      // optimizationLevel  0~7   越高越危险
      imagemin({optimizationLevel: 5}),
      gulp.dest(scvutil.tmpSpace+'/'+imagePath)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
  //   console.error('css error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;
});
gulp.task('html', function() {
  var combined = combiner.obj([
      gulp.src(htmlWatch),
      changed(scvutil.tmpSpace+'/'+htmlPath,{extension: '.html'}),
      htmlmin({
        collapseWhitespace: true, //去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
        // removeComments:true,   //去除html中的CDATA(<!--*-->),默认false,如果是模板的话可要注意了,别把你的模板标记去了
        // removeCommentsFromCDATA:true //去除 script,style中的CDATA(<!--*-->),默认false
      }),
      gulp.dest(scvutil.tmpSpace+'/'+htmlPath)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
  //   console.error('css error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;
});

// 发布，需要处理，
// 1 所有文件中的图片，
// 2所有文件中的css 
// 3 所有文件中js，
// 4所有文件中的html
gulp.task('release', function() {
  var combined = combiner.obj([
      gulp.src(cssWatch),
      changed(scvutil.tmpSpace+'/'+htmlPath,{extension: '.html'}),
      htmlmin({
        collapseWhitespace: true, //去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
        // removeComments:true,   //去除html中的CDATA(<!--*-->),默认false,如果是模板的话可要注意了,别把你的模板标记去了
        // removeCommentsFromCDATA:true //去除 script,style中的CDATA(<!--*-->),默认false
      }),
      gulp.dest(scvutil.tmpSpace+'/'+htmlPath)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
  //   console.error('css error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;

});

// 监控任务
gulp.task('watch', function () {
  var watchs = config.watch;
  if (watchs.indexOf('js')>-1) {
    gulp.watch(jsWatch, ['js']);
  }
  if (watchs.indexOf('css')>-1) {
    gulp.watch(cssWatch, ['css']);
  }
  if (watchs.indexOf('image')>-1) {
    gulp.watch(imageWatch, ['image']);
  }
  if (watchs.indexOf('html')>-1) {
    gulp.watch(htmlWatch, ['html']);
  }
});
// 默认执行任务
config.watch.push('watch');
// console.log(config.watch);
gulp.task('default', config.watch);
/******************************以下是自定义gulp任务*/
/**
 * scv工程中合并目录中文件的gulp插件,内部代码参考gulp-concat
 * 由于可合并文件夹内的文件再暂存区没有对应的文件，所以每次文件改动所有的可合并文件夹都会执行一次合并，待优化
 * @param  json options  {
 *                       suffix:'js'    //
 *                       }
 * @return gulp through pipe
 */
function scvconcat(options){
  // 需要合并的列表
  var concatlist = {};

  options = options ||{};
  var suffix = options.suffix || 'js';

  return through.obj(function (file, env, cb) {
      if (!file && typeof file !=='object') {
        this.emit('error', new gutil.PluginError('scv','丢失文件参数或者文件参数不是对象'));
        cb();
        return;
      }
      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('scv','暂不支持stream'));
        cb();
        return;
      }

      var filePath = path.dirname(file.relative);
      //func 如果当前文件所在文件夹是可合并文件夹，合并文件
      var onefilepath = path.dirname(file.path)+'/'+scvutil.oneFile;
      // console.log(onefilepath);
      if (fs.existsSync(onefilepath)) {
        if (!(filePath in concatlist)) {
          concatlist[filePath] = [];
        }
        concatlist[filePath].push(file);
      }else{
        this.push(file);
      }
      // 下面这两句基本上是标配
      cb();
  },function(cb){
    // 循环将需要合并的文件夹
    for(var concatpath in concatlist){
      var flist = concatlist[concatpath];
      var rpath = path.dirname(concatpath);  //取其上级目录
      var fileName = path.basename(concatpath)+'.'+suffix; //合并后的文件名取文件夹名
      console.log('合并'+suffix+'文件夹：'+concatpath+'->'+rpath+'/'+fileName);
      
      var concat = new Concat(false, fileName, gutil.linefeed);
      // 遍历合并目录
      for (var i = 0,l=flist.length; i < l; i++) {
        var _file = flist[i];
        concat.add(_file.relative, _file.contents, _file.sourceMap);
      }
      // 合并成一个文件
      var joinedFile = new gutil.File();
      joinedFile.path = path.join(rpath, fileName);
      joinedFile.contents = concat.content;
      if (concat.sourceMapping) {
        joinedFile.sourceMap = JSON.parse(concat.sourceMap);
      }
    }
    this.push(joinedFile);
    cb();
  });
}

/**
 * scv的资源版本处理工具，代码参考gulp-assets-md5
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function scvrev(options){

}
