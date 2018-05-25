/**
 * 提供image文件的相关流操作
 */
const path = require('path');
const sutil = require('../sutil');
const through = require('through2');
const vinyl = require('vinyl');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');   //jpg图片压缩
const imageminOptipng = require('imagemin-optipng');  //png图片压缩

module.exports = imageActions;



// imagemin 配置默认
let defOpt = {
		// imagemin
		def:{
			interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
		    multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
			svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
			verbose:true,
		},
		// imageminJpegRecompress
		jpg:{
	        accurate: true,//高精度模式
	        quality: "high",//图像质量:low, medium, high and veryhigh;
	        method: "smallfry",//网格优化:mpe, ssim, ms-ssim and smallfry;
	        min: 80,//最低质量
	        loops: 0,//循环尝试次数, 默认为6;
	        progressive: false,//基线优化
	        subsample: "default"//子采样:default, disable;
	    },
	    // imageminOptipng
	    png:{
	    	optimizationLevel: 4
	    }
	},
	opt;

/**
 * image类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function imageActions(actions){
      sutil.log('->images:');
	// 压缩
    if (actions.compress) {
      	sutil.log('\taction:compress...',actions);
		let defopt = typeof actions.compress ==='object'?actions.compress:defOpt;
		// 默认参数
		let jpgopt = defopt.jpg||{},
			pngopt = defopt.png||{},
			jpgmin = imageminJpegRecompress(jpgopt),
		    pngmin = imageminOptipng(pngopt);

		opt = defopt.def||{},
		opt.plugins = [jpgmin,pngmin];
	}
	return imagemin(opt);
};
