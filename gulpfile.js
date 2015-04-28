////////////////////for wwwtpl  by awen////////////////////
//通用的前端自动化处理配置,依托于gulp
//用户只需要修改basepath 为开发环境的目录路径就可以了（即src目录的父目录）
///////////////////////////////////////////////////////////
// 文件目录配置部分,
var basepath ="demos/";
var paths = {
  //js源码文件目录
  ////如果多个js,需要按照顺序合并请使用如下方式：
  // jss: [basepath+'src/1.js',basepath+'src/2.js'basepath+'src/3.js'...],
  jss: [basepath+'src/js/*.js'],
  //要合并压缩的js文件目录数组 ,每个目录下符合要求的js文件将在目标文件夹中生成一个文件
  jssconcat:[
              [basepath+'src/js/test/*.js']
            ], 
  // 如果有排序要求，这个目录也可以写成一个个有序的文件,或者干脆再文件名上做文章，让获取到的文件直接就是顺序的
  // jssconcat: [[basepath+'src/js/test/1.js',basepath+'src/js/test/2.js'],[另外一组需要合并的文件]], 
  // 与jssconcat一一对应代表合并压缩过的唯一文件的名称
  jssconcatnames:['main.min.js'],

  htmls: [basepath+'src/html/*.html'],  //静态html文件目录
  imgs: [basepath+'src/image/*.*'],
  jsons: [basepath+'src/json/*.*'],
  //concat 要合并压缩的css文件目录数组,每个目录下符合要求的css文件将在目标文件夹中生成一个文件
  csssconcat: [
                [basepath+'src/css/test/2.css',basepath+'src/css/test/1.css'],
                [basepath+'src/css/public/**/*.css'],
              ],
  // 与csssconcat一一对应代表合并压缩过的唯一文件的名称
  csssconcatnames:['test.min.css','main.min.css'],
  //css源码文件目录
  csss : [basepath+'src/css/*.css'],

  distjs:basepath+'dist/js',
  distcss:basepath+'dist/css',
  disthtml:basepath+'dist/html',
  distimg:basepath+'dist/image',
  distjson:basepath+'dist/json',
};

// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var minifyCSS = require('gulp-minify-css');
var jsonminify = require('gulp-jsonminify');
var cleanhtml = require('gulp-cleanhtml');
var htmlmin = require('gulp-htmlmin');
////////////////////////////////////////////
// 需要合并js,最终生成一个文件
gulp.task('mjs', function() {
  for (var i=0,l=paths.jssconcat.length;i<l;i++) {
    gulp.src(paths.jssconcat[i])
      .pipe(jshint())
      .pipe(concat(paths.jssconcatnames[i]))
      .pipe(uglify({outSourceMap: false}))
      .pipe(gulp.dest(paths.distjs));
  }
});
// 压缩js
gulp.task('js', function() {
  if (paths.jss.length>0) {
    return gulp.src(paths.jss)
        .pipe(jshint())
      .pipe(uglify({outSourceMap: false}))
      .pipe(gulp.dest(paths.distjs));
  }
});
    
//合并压缩css
gulp.task('mcss', function() {
  for (var i=0,l=paths.csssconcat.length;i<l;i++) {
    gulp.src(paths.csssconcat[i])
    .pipe(concat(paths.csssconcatnames[i]))
    .pipe(minifyCSS({'removeEmpty':true}))
    .pipe(gulp.dest(paths.distcss));
  }
});
// 压缩css,最终生成一个main-min.css
gulp.task('css', function() {
  if (paths.csss.length>0) {
    return gulp.src(paths.csss)
    .pipe(minifyCSS({'removeEmpty':true}))
    .pipe(gulp.dest(paths.distcss));
  }
});
// 清理,压缩 html
gulp.task('html', function() {
  if (paths.htmls.length>0) {
    return gulp.src(paths.htmls)
      .pipe(cleanhtml())
      .pipe(htmlmin({
        collapseWhitespace: true, //去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
        // removeComments:true,   //去除html中的CDATA(<!--*-->),默认false,如果是模板的话可要注意了,别把你的模板标记去了
        // removeCommentsFromCDATA:true //去除 script,style中的CDATA(<!--*-->),默认false
      }))
      .pipe(gulp.dest(paths.disthtml));
  }
});
// 压缩 json
gulp.task('json', function () {
  if (paths.jsons.length>0) {
    return gulp.src(paths.jsons)
    .pipe(rename(function (path) {
      // path.dirname = "./json/";
      path.basename += "-min";
      // path.extname = ".json"
    }))
    .pipe(jsonminify())
    .pipe(gulp.dest(paths.distjson));
  }
});
// 压缩图片
gulp.task('img', function() {
  if (paths.imgs.length>0) {
     return gulp.src(paths.imgs)
      // optimizationLevel  0~7   越高越危险
      .pipe(imagemin({optimizationLevel: 5}))
      .pipe(gulp.dest(paths.distimg));
  }
});
// 监控
gulp.task('watch', function () {
  gulp.watch(paths.jss, ['js']);
  gulp.watch(paths.jssconcat, ['mjs']);
  gulp.watch(paths.csss, ['css']);
  gulp.watch(paths.csssconcat, ['mcss']);
  gulp.watch(paths.jsons, ['json']);
  gulp.watch(paths.htmls, ['html']);
  gulp.watch(paths.imgs, ['img']);
});

// 默认执行的任务
gulp.task('default', ['js','css','mjs','mcss','html','json','img', 'watch']);