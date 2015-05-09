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
var jsWatch = '/**/*.js';
var cssWatch = '/**/*.css';
var imageWatch = '/**/*.+(jpg|png)';
var htmlWatch = '/**/*.html';

//拼组路径
var jsDst = path.join(scvutil.tmpSpace,jsPath);
var jsSrc = path.join(scvutil.workSpace,jsPath,jsWatch);
var cssDst = path.join(scvutil.tmpSpace,cssPath);
var cssSrc = path.join(scvutil.workSpace,cssPath,cssWatch);
var imgDst = path.join(scvutil.tmpSpace,imagePath);
var imgSrc = path.join(scvutil.workSpace,imagePath,imageWatch);
var htmlDst = path.join(scvutil.tmpSpace,htmlPath);
var htmlSrc = path.join(scvutil.workSpace,htmlPath,htmlWatch);
var revPath =path.join(scvutil.revSpace,config.version);
var revAssets = path.join(revPath,'assets');
var revlog =path.join(revPath,'log.txt');
/***********************************gulp任务*/
// 常规任务
gulp.task('js', function() {
  var combined = combiner.obj([
      gulp.src(jsSrc),
      changed(jsDst,{extension: '.js'}),
      jshint(),
      scvconcat({suffix:'js'}),
      uglify({outSourceMap: false}),
      gulp.dest(jsDst)
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
      gulp.src(cssSrc),
      changed(cssDst,{extension: '.css'}),
      autofixer({
                // browsers: ['> 1%','last 5 versions','Firefox ESR','Opera 12.1'],
                browsers:['last 10 version', 'safari 5','ie > 9', 'opera 12.1', 'ios 6', 'android 2.3'],
                cascade: false
            }),
      scvconcat({suffix:'css'}),
      minifyCSS({'removeEmpty':true}),
      gulp.dest(cssDst)
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
      gulp.src(imgSrc),
      changed(imgDst),
      // optimizationLevel  0~7   越高越危险
      imagemin({optimizationLevel: 5}),
      gulp.dest(imgDst)
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
      gulp.src(htmlSrc),
      changed(htmlDst,{extension: '.html'}),
      htmlmin({
        collapseWhitespace: true, //去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白
        // removeComments:true,   //去除html中的CDATA(<!--*-->),默认false,如果是模板的话可要注意了,别把你的模板标记去了
        // removeCommentsFromCDATA:true //去除 script,style中的CDATA(<!--*-->),默认false
      }),
      gulp.dest(htmlDst)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
  //   console.error('css error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;
});

// 发布，需要处理，
// 1 所有文件中的图片
// 2 所有文件中的css 
// 3 所有文件中js
gulp.task('release', function() {
  var combined = combiner.obj([
      gulp.src(path.join(scvutil.tmpSpace,'assets','/**/*.+(css|js|png|jpg)')),
      scvrev(path.join(revPath,htmlPath,htmlWatch),10),
      gulp.dest(revAssets)
    ]);
  // console.log(revPath+jsPath+jsWatch);
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
    gulp.watch(jsSrc, ['js']);
  }
  if (watchs.indexOf('css')>-1) {
    gulp.watch(cssSrc, ['css']);
  }
  if (watchs.indexOf('image')>-1) {
    gulp.watch(imgSrc, ['image']);
  }
  if (watchs.indexOf('html')>-1) {
    gulp.watch(htmlSrc, ['html']);
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

      var relfilePath = path.dirname(file.relative);

      //func 如果当前文件所在文件夹是可合并文件夹，合并文件
      var onefilepath = path.dirname(file.path);
      onefilepath = path.join(onefilepath,scvutil.oneFile);
      // console.log(onefilepath);
      if (fs.existsSync(onefilepath)) {
        if (!(relfilePath in concatlist)) {
          concatlist[relfilePath] = [];
        }
        concatlist[relfilePath].push(file);
      }else{
        this.push(file);
      }
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
      this.push(joinedFile);
    }
    concatlist = null;
    cb();
  });
}

/**
 * scv的资源版本处理工具，代码参考gulp-md5-plus和gulp-rename
 * @param  {string} htmlpath 要更新的html文件
 * @param  {int} size 取MD5的前几位 默认10
 */
function scvrev(htmlpath,size){
  size = size | 10;

  var assetsList = [];
  return through.obj(function (file, env, cb) {
    if (!file && typeof file !=='object') {
      this.emit('error', new gutil.PluginError('scv','丢失文件参数或者文件参数不是对象'));
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('scv','暂不支持stream'));
      return cb();
    }
    if(!file.contents){
      return cb();
    }
    // 将资源文件生成md5文件
    var suffix = calcMd5(file.contents,size),
      oldrelfile = file.relative,
      fobj_old = parsePath(file.path),fobj_new,
      md5name = fobj_old.basename+'_'+suffix+fobj_old.extname,
      md5path = path.join(fobj_old.dirname,md5name);
    console.log('[scv] md5资源文件:'+file.relative+'->'+md5name);
    scvutil.log(revlog,file.relative+'->'+md5name);


    // 资源文件路径转换(1换成md5文件名，2如果有必要根据配置置换线上地址)
    file.path = md5path; //设置新路径之后，传给其他函数后将变成新路径的file
    var pathobj = getAssetsUrl(oldrelfile,file,fobj_old.extname);
    assetsList.push(pathobj);
    
    this.push(file);
    cb();
  },function(cb){
    // 替换html中的所有资源文件为新路径
    if (assetsList.length>0) {
      var glob  =require('glob');
      glob(htmlpath, function (err, files) {
        if(err) return console.log(err);
        files.forEach(function(fpath){
          console.log('处理文件中的发布资源文件：'+fpath);
          var content = fs.readFileSync(fpath,'utf8');
          assetsList.forEach(function(asset){
            // console.log('>>处理资源：'+asset.newpath);
            content = content.replace(asset.regexp,asset.newpath);
          });
          fs.writeFileSync(fpath, content, 'utf8');
        });
      });
    }
    cb();
  });
}
//md5
function calcMd5(str,size) {
  var crypto = require('crypto');
  var md5 = crypto.createHash('md5');
  md5.update(str, 'utf8');
  return size >0 ? md5.digest('hex').slice(0, size) : md5.digest('hex');
}
// 将路径转换为对象
function parsePath(fpath) {
  var extname = path.extname(fpath);
  return {
    dirname: path.dirname(fpath),
    basename: path.basename(fpath, extname),
    extname: extname
  };
}

var prefix = {
    '.js':config.assetsDomain.js,
    '.css':config.assetsDomain.css,
    '.jpg':config.assetsDomain.image,
    '.png':config.assetsDomain.image,
  },oldPrefix = {
    '.js':path.join('../',jsPath),
    '.css':path.join('../',cssPath),
    '.png':path.join('../',imagePath),
    '.jpg':path.join('../',imagePath),
  };
// 根据config配置获取html中实际资源引用地址
function getAssetsUrl(oldrelfile,newfile,ext){
  var newrelpath = newfile.relative,
    oldrelpath = path.join('../',oldrelfile),
    oldPath,newPath;

  if (prefix[ext]) {
    oldPath = path.join(oldPrefix[ext],oldrelpath);
    newPath = path.join(prefix[ext],path.join('../',newrelpath));
  }else{
    oldPath = oldrelfile;
    newPath = newfile.relative;
  }
  return {
    newpath : newPath,
    regexp : new RegExp(oldPath,'g'),
    oldpath : oldPath,
  };
}
