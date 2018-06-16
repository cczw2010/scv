/**
 * 提供image文件的相关流操作
 */
const path = require('path');
const sutil = require('../sutil');
const chalk = require('chalk');
const imagemin = require('imagemin');
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
	};

/**
 * image类型的文件操作,比如校验,合并,压缩等
 * @param  {object} actions watchitem中的actions项
 * @return {boolean}    through stream
 */
function imageActions(actions){
	return async function(file, enc, cb){
        let str = file.contents.toString()
        	err = null;
        // 图片的文件自己输出
    	sutil.log('->'+file.relative,(file.event||'check'));
		// 压缩
	    if (actions.compress) {
	      	let msg = '\taction:compress...';
			// 参数
	      	let defopt = typeof actions.compress ==='object'?actions.compress:defOpt;
			let jpgopt = defopt.jpg||{},
				pngopt = defopt.png||{},
				jpgmin = imageminJpegRecompress(jpgopt),
			    pngmin = imageminOptipng(pngopt);

			let opt = defopt.def||{};
			opt.plugins = [jpgmin,pngmin];

	      	let [err,result] = await imagemin.buffer(file.contents, opt).then(data => {
					const originalSize = file.contents.length;
					const optimizedSize = data.length;
					const saved = originalSize - optimizedSize;
					const percent = originalSize > 0 ? (saved / originalSize) * 100 : 0;
					const savedMsg = saved > 0 ?`saved ${saved}bytes - ${percent.toFixed(1).replace(/\.0$/, '')}%`: 'already optimized';

					if (opt.verbose) {
						sutil.log(msg+ '✔ '+ chalk.gray(` (${savedMsg})`));
					}

					file.contents = data;
					// cb(null,file);
					return [null,file];
				})
				.catch(err => {
    				sutil.log(msg +'x',err);
        			// sutil.log('\terror no:'+err.line+'\tmsg:'+err.reason);
					// cb(null,file);
					return [err,file];
				});
		}
		cb(err, file);
	};
};
