/**
 * 工程配置
 * @name 应用名称
 * @ename 应用英文名称
 * @descriptyion  应用描述
 * @version  应用版本,每次release生成的版本名称也是依据此处，请使用三段版本
 * @watch 工程需要处理的目录，包括js|css|image|html	,image本版本不做压缩处理
 * 
 * @main  入口html页面,测试需要知道入口。
 * @port	工程测试服务端口
 * 
 * @release  发布目录的相对路径，这里相对的是scv根目录
 * @assetsDomain 资源文件发布时的前置域名，比如要发布到cdn：http://cdn.xxx.com/img/,默认空表示保留当前路径
 */
module.exports = {
		name:'示例工程',
		ename:'scv-demo',
		description:'scv工程流模板工程',
		version:'1.0.0',
		watch:['js','css','image','html'],
		// 测试参数
		// main:'html/index.html',
		// port:8001,
		//发布参数
		assetsDomain:{
				'js':'',	// http://cdn.xxx.com/js/
				'css':'',	//http://css.xxx.com/css/
				'image':''	//http://css.xxx.com/i/
			},
	};