var gulp = require('gulp'); 
var fs = require('fs'); 
var path = require('path'); 

var gutil = require('gulp-util');
var through = require('through2');
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

var connect = require('gulp-connect');
var livereload = require('gulp-livereload');

// 目录，配置
var workPath = process.cwd();
var config = require(workPath+'/config.js');

var workSpace = 'workspace/';
var tmpSpace = 'tmp/';
var releaseSpace = 'release/';
var onefile = '.one';

// 资源相对目录
var jsPath = 'assets/js';
var cssPath = 'assets/css';
var imagePath = 'assets/image';
var htmlPath = 'html';
// 监控
var jsWatch = workSpace+jsPath+'/**/*.js';
var cssWatch = workSpace+cssPath+'/**/*.css';
var imageWatch = workSpace+imagePath+'/**/*.*';
var htmlWatch = workSpace+htmlPath+'/**/*.html';

/***********************************gulp任务*/
// 常规任务
gulp.task('js', function() {
	return gulp.src(jsWatch)
          .pipe(changed(tmpSpace+jsPath,{extension: '.js'}))
	        .pipe(jshint())
          .pipe(scvconcat({suffix:'js'}))
	        .pipe(uglify({outSourceMap: false}))
	        .pipe(gulp.dest(tmpSpace+jsPath));
});
gulp.task('css', function() {
  return gulp.src(cssWatch)
          .pipe(changed(tmpSpace+cssPath,{extension: '.css'}))
          .pipe(scvconcat({suffix:'css'}))
          .pipe(minifyCSS({'removeEmpty':true}))
          .pipe(gulp.dest(tmpSpace+cssPath));
});
gulp.task('image', function() {
  return gulp.src(imageWatch)
          .pipe(changed(tmpSpace+imagePath))
          // optimizationLevel  0~7   越高越危险
          .pipe(imagemin({optimizationLevel: 5}))
          .pipe(gulp.dest(tmpSpace+imagePath));
});
gulp.task('html', function() {
  return gulp.src(htmlWatch)
          .pipe(changed(tmpSpace+htmlPath,{extension: '.html'})) //由于需要合并的目录A在工作缓存区肯定没有对应的内容，所以A每次都能触发
          .pipe(htmlmin({
            collapseWhitespace: true, //去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
            // removeComments:true,   //去除html中的CDATA(<!--*-->),默认false,如果是模板的话可要注意了,别把你的模板标记去了
            // removeCommentsFromCDATA:true //去除 script,style中的CDATA(<!--*-->),默认false
          }))
          .pipe(gulp.dest(tmpSpace+htmlPath));
});

// 发布，需要处理，1 所有文件中的图片，2所有文件中的css 3 所有文件中js，4所有文件中的html
gulp.task('release', function() {

  var assetsmd5 = require('gulp-md5-assets');

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
      var onefilepath = path.dirname(file.path)+'/'+onefile;
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
      console.log('可合并文件夹：'+concatpath);
      var flist = concatlist[concatpath];
      var fileName = path.basename(concatpath)+'.'+suffix; //合并后的文件名取文件夹名
      var concat = new Concat(false, fileName, gutil.linefeed);
      // 遍历合并目录
      for (var i = 0,l=flist.length; i < l; i++) {
        var _file = flist[i];
        var rpath = path.dirname(concatpath);  //取其上级目录
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
