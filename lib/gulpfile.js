var gulp = require('gulp'); 
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
// var imgcache = require('gulp-cache');
var autofixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
// var cleanhtml = require('gulp-cleanhtml');
// var htmlmin = require('gulp-htmlmin');
var connect = require('gulp-connect');
var livereload = require('gulp-livereload');
  
// 工作目录
var workPath = process.cwd();
// 监控目录列表
var jsSrc = workPath+'/assets/src/js/*';
var cssSrc = workPath+'/assets/src/css/*';
var imageSrc = workPath+'/assets/src/image/*';
var htmlSrc = workPath+'/html/src/*';
// 目标目录
var jsDist = workPath+'/assets/js';
var cssDist = workPath+'/assets/css';
var imageDist = workPath+'/assets/image';
var htmlDist = workPath+'/html';

gulp.task('watch', function () {
  gulp.watch(jsSrc, ['js']);
});

gulp.task('default', ['js','watch']);

////////////////////////////////以下是各个任务的具体实现
// js任务
gulp.task('js', function() {
	return gulp.src(jsSrc)
	        .pipe(jshint())
	        .pipe(uglify({outSourceMap: false}))
	        .pipe(gulp.dest(jsDist));

	// var jsSrc = workPath+'/assets/js';
	// fs.readdir(jsSrc,function(err,path){
	// 	console.log(err);
	// 	console.log(path);
	// });
	// // 需要合并js,最终生成一个文件
 //  for (var i=0,l=paths.jssconcat.length;i<l;i++) {
 //    gulp.src(paths.jssconcat[i])
 //      .pipe(jshint())
 //      .pipe(concat(paths.jssconcatnames[i]))
 //      .pipe(uglify({outSourceMap: false}))
 //      .pipe(gulp.dest(paths.distjs));
 //  }
});