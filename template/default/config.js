/**
	* 工程配置
	* @name 应用名称
	* @ename 应用英文名称
	* @descriptyion  应用描述
	* @version  应用版本,每次release生成的版本名称也是依据此处，请使用三段
	* ******监控目录部分
	* @workSpace  工程源码目录的相对路径,用户在这里开发,文件中引用其他目录中的资源文件时请使用`[相对路径]`,
	* @tempSpace  scv缓存目录的相对路径
	* @releaseSpace  发布目录的相对路径,工程发布后会在这里生成一个版本用于上线
	* ******监控目录配置部分
	* @watchs   [watchItem,watchItem,...]
	*    这是工程对所有资源文件的操作配置,数组中的每个元素代表一个监控对象配置对象(目录),每个watchItem监控对象最终都会进行拷贝工作到发布目录,具体结构如下:
	*    {
	*		// 监控对象的类型,目前系统支持:js|css|html|other几种内置默认类型.出other外每种类型都有自己的actions,other没有对应的action,只会平移复制.
	*		type:'js',
	*		// 监控目录数组,相对于工作目录(workspace)
	*		paths:['assets/js'],
	*		// 监控目录中需要监控文件的后缀名数组
	*		exts:['js'],
	*		// 对监控目录进行的动作,执行顺序为: hint->concat->prefix->compress ,如果有一个出错则中断文件操作
	*		actions:{
	*			
	*   	//>是否进行语法检查,默认false,该动作支持的类型有:js|css
	*    	//[js]	使用的是jshint插件, 当为true时使用相关工具的默认配置,{outSourceMap:false,compress:{unused:false}}
	*			//[css]	使用的css插件的parse方法(参数slient程序中恒为true)
	*			hint:true|false|{options},
	* 
	*			//>是否压缩,默认false,该动作支持的类型有:js|css|html . 
	*			//[js]	使用的是uglifyjs,当为true时 使用的是默认的配置,个性化配置可参考uglifyjs(参数fromString程序中恒为true)
	*			//[css]	使用的是clean-css插件,
	*			//[html]	使用html-minifier插件,默认{collapseWhitespace: true,minifyJS:true,minifyCSS:true,relateurl:true,removeComments: true}
	*			compress:true|false|{options},
	*			
	*   	//>自动为代码增加浏览器私有前缀 仅支持:css
	*    	//[css]	使用autoprefixer插件, 具体参数参考autoprefixer插件. 数据来源参考can i use
	*			prefix:false|true|[options],
	*			
	*   	//>合并文件夹操作,该动作支持的类型有:js|css|html|other. 
	*    	//值为合并后的文件路径名(,相对于工作目录workspace),系统将在需要合并的目录同级生成生成目标文件(按名称排序),如不需合并则设为false
	*			concat:'assets/js/all.js',
	*		},
	*   //是否按照以上规则递归处理子目录,默认false
	*		depth:false,
	*  	//发布时系统将自动将资源文件根据设置的前缀信息更换为线上路径,这需要用户在书写源码的时候必须使用相对路径.如果不需要则设置为false(默认)
	*		domain:[false]
	* }
	*
	* ******测试部分暂未实现，预留
	* @main  入口html页面,测试需要知道入口。
	* @port	工程测试服务端口
*/
module.exports = {
		name:'示例工程',
		ename:'scv-demo',
		description:'scv前端工程自动化demo',
		version:'1.0.0',
		// *测试参数
		// main:'html/index.html',
		// port:8001,
		// *目录配置
		workSpace:'workspace',
		tmpSpace:'tmp',
		releaseSpace:'release',
		// *资源文件配置
		watchs:[{	
				type:'css',
				paths:['assets/css'],
				exts:['css'],
				actions:{
					hint:true,
					prefix:true,
					compress:true,
					concat:false
				},
				depth:true,
				domain:''
			},{	
				type:'js',
				paths:['assets/js'],
				exts:['js'],
				actions:{
					// concat:false,
					concat:'assets/js/all.js',
					compress:true,
					hint:true,
				},
				depth:true,
				domain:''
			},{	
				type:'html',
				paths:['html'],
				exts:['html','tpl'],
				actions:{
					compress:true,
					concat:'html/all.html'
				},
				depth:true,
				domain:''
			},{	
				type:'other',
				paths:['assets/image'],
				exts:['*'],
				actions:{
					compress:true
				},
				depth:true,
				domain:''
			}
		]
	};