##开始之前

  一个前端工程除了开发之外还有一堆让你头疼的问题，比如创建一个干净的工程（或者自己常用的一套工程模板），统一的目录，命名，代码规范（多人协作），模块化开发，检查js,css的语法检查，合并和压缩资源，js,css资源文件变化时更新资源文件版本，各种js库的版本管理，效果测试等等各种问题。这些在前段工程的开发中占据了大量的时间精力，一不小心就会出错，上线发布时更是要慎之又慎。这些其实每个问题都有几个成熟的工具可以使用，但是如何让他们糅合在一起就是集成解决方案要做的事情了。

  目前类似框架也有很多，比较出名的有：google的[yeoman](http://yeoman.io/)，社区比较成熟，用的也比较多，已经很强大了。还有比较亲民的百度[FIS](http://fis.baidu.com/)，工作流已经实现的非常完善了.其他的构建工具还有gulp,fez等。

##SCV简介

 SCV名字借鉴了星际中的太空工程车，宗旨在建立一个简单的工作流，尽可能的为开发者解决web应用开发前期工程部署以及后期版本更新升级过程中遇到的各种繁琐问题，让程序员更多的精力用在实际的开发上去。

 值得一提的是，scv是为了解决编写代码之外的一些工作流问题。haml,coffee script,sass,styles,less等一些华丽外衣, 用户只需自己使用相应插件(兼容gulp插件)即可支持.

 工具环境当然使用nodejs,多人协作可以借助于`git`（建议自行使用，scv不集成强制使用）,js库版本管理可以用`bower`（建议自行使用，scv不集成强制使用）,工程流内资源处理用gulp插件，测试可以借助于phantomjs，CasperJS，资源文件发布版本管理可以使用文件的数字摘要算法。这就是基本思路.

##环境

	`nodejs请更新到最新版本`

##关于模块化开发

  SCV只是一个工作流工具,不应该参与或限制实际代码开发.所以是不强制给开发者订立开发规范的，但是还是建议大家按照一定的规范来开发。比如前端模块开发规范（**CMD**|**AMD**）。

##版本历史

>**v2.2.5**

>>修改release命令，生成版本化资源文件；增加-v命令参数 指定生成的目录，默认release工作根目录

>**v2.2.4**

>>完善watch，compress -w命令同时支持concat，但是默认不支持监控直接删除目录，操作时请注意

>**v2.2.3**

>>2年多了今天看到了代码，忍不住看了看，然后又忍不住更新了compress命令，增加image压缩处理支持，梳理了一下watch命令

>**v2.2.0**

>>开放scv compress命令

>**v2.1.3**

>>npm安装经常丢失根目录下的index.js. 费解,改为lib内为main文件

>**v2.1.0** @2016-1-22

>> 长期搁置之后进行了一次较大的重构,结果发现基本是把gulp实现了一遍.(早知如此不如开始就在gulp源码上修改),所以目前支持gulp的类似用法,同时自主实现了一套前端自动化cli命令用于开发. 重点如下:

>* 去除了对gulp的依赖,安装时不需要再安装gulp(api略有差异,请查看下面用法一中的api)

>* 内部实现了src,dest,watch方法,具体使用方法参考[gulp](http://www.gulpjs.com.cn/docs/api/)(二次开发用)

>* 任务流使用orchestrator实现,并没有像gulp一样直接继承并

重指向为task方法. 而是将orchestrator实例直接赋到task属性上. 由task属性对外提供add, start,on等方法以及事件.具体使用方法可参考[orchestrator](https://www.npmjs.com/package/orchestrator)的文档.(二次开发用)

>* 文件流基于vinyl-fs,所以开发兼容gulp插件(二次开发用)

>* 自动化工程cli工程配置文件进行了重构,配置更灵活.



##如何使用

 	#帮助
 	scv -h

 **|用法一**
>命令行类似gulp的常规书写代码用法,任务文件中兼容gulp插件,(当然这不是重点,纯属顺手,用法二才是本工具重点)

	#安装本地scv插件
	npm install scv
	#类似gulp的使用方法,使用自定义的任务文件
	scv -f|--scvfile  scvfile.js
	#如果指定了自定义scvfile任务文件,可以通过该参数指定要启动的任务名称,默认为default'
	scv -f scvfile.js -t default

>API

	scv.src		#参考gulp.src, 设置文件来源
	scv.dest		#参考gulp.dest, 在文件流目标位置生成新文件
	>gulp.watch,  gulp老版本的vinyl-fs基于gaze实现的,不过性能貌似有些问题,后来用chokidar实现了单独gulp-watch插件, 这里强烈建议.scv就不单独实现了,用户可以自行添加.

	#scv.task与gulp略有区别,gulp是继承orchestrator并重指向可部分方法名.
	scv的task对象是任务流orchestrator的实例,具体使用方法参考orchestrator的api. 
	值得一提的是,如果你不使用-t参数指定入口任务,那么你就需要在任务文件中实现一个default名称的任务为入口任务, 因为scv会自动调用`scv.task.start('default')` 来启动它.*/
	scv.task.add		#等同于gulp.task
	scv.task.hasTask	#检查是否存在某任务
	scv.task.start		#启动任务
	#新增加同步执行任务列表方法,上一个任务的结束(task_stop事件)自动执行下一个任务, 可在设计任务的时候,在逻辑中调用任务的callback函数告诉引擎你的任务真正结束了, 不传参默认所有任务列表
	scv.task.startQueue(taskarray)

 **|用法二**
 >scv默认实现了一套任务文件工作流CLI命令(全局安装目录下的scvfile.js任务文件), 工程的参数设定依赖工作目录下的config.js文件.并提供了一系列的子命令,形成一套完整的前端工程自动化工具

 	#安装全局cli工具
 	npm install -g scv

	#创建工程
	mkdir test		#创建工程目录
	cd test			#进入工程目录

	/*****************
	*Scv前端工程自动化-初始化命令
	*请在空目录下执行该命令,可指定初始化时的模板名称,工程默认模板为default
	*****************/
	#不在需要在工作目录安装scv
	scv init 			#初始化工程(使用默认模板)（按照约定规范生成目录，并启动工程监控）
	#scv init test		#或者按照模板初始化新工程

	/*****************
	*Scv前端工程自动化-校验命令
	*****************/

	#校验配置文件中某类型的配置项, 不设则为全部支持hint的类型,本方法不会在release中生成文件
	scv hint -o|--otype  [css|
	#实时监控文件变化,校验文件. 可结合-o指定监控类型,用户可以通过`ctrl+c`中断服务
	scv hint -w|--watch

	/*****************
	*Scv前端工程自动化-压缩命令
	*****************/

	#压缩配置文件中某类型的配置项, 如果有合并选项也会执行合并操作。-o参数指定某类型的配置项，不设则为全部支持compress的类型,本方法会在release中生成对应的目录和文件，但是不会在版本目录中
	scv compress -o|--otype  [css|
	#实时监控文件变化,压缩文件. 可结合-o指定监控类型,用户可以通过`ctrl+c`中断服务
	scv compress -w|--watchs

	/*****************
	*Scv前端工程自动化-模板命令
	* 1.自带一个默认模板和配置文件.
	* 2.用户可随时将自己的工作目录和配置文件保存成模板,也可随时删除模板
	*****************/
	#生成模板，将当前工程保存为模板(mytmp)，初始化新工程时可以使用该模板初始化
	scv template -s|--save mytmp

	#查看模板列表
	scv template -l|--list

	#删除已有模板
	scv template -d|--delete mytmp

	/*****************
	*Scv前端工程自动化-发布相关命令
	*****************/
	#发布工程,自动生成资源文件版本，如果版本存在会询问是否覆盖，并记录每次发布版本的一些信息。便于查询
	scv release

	#查看发布版本日志
	scv release -i|--info

##用法二中默认模板目录

 目录自然要定制规范，下面就是一个工程的基本目录，当然除了开发者实际开发的文件，目录都是自动创建的，下面是一个默认的开发模板，并给出了示例文件说明。

	 工程目录
		|--workspace(工作区)
		|--release(版本发布区)
		|		|--v1.0.0(example)
		|		|--...
		|--config.js


>**config.js**是工程配置文件，这个需要用户维护一些工程的自动化基本信息,详细配置下面有描述

>**workspace**是默认模板的工作区,用户在此开发，开发区内部所有文件修改保存时都会自动同步到*tmp暂存区*对应目录下的同名目录。*文件的编码格式统一为utf-8** ,文件中引用资源文件时务必请使用`[相对路径]`, 否则合并或者发布操作时可能会出现问题.

>**release**版本发布区,自动维护资源文件版本.


###用法二config配置

>下面是默认模板中的config配置文件以及详细注释：

		/**
 		* 工程配置
 		* @name 应用名称
 		* @ename 应用英文名称
 		* @descriptyion  应用描述
 		* @version  应用版本,每次release生成的版本名称也是依据此处，请使用三段
		* ******监控目录部分
 		* @workSpace  工程源码目录的相对路径,用户在这里开发,文件中引用其他目录中的资源文件时请使用`[相对路径]`,
 		* @releaseSpace  发布目录的相对路径,工程发布后会在这里生成一个版本用于上线
		* ******监控目录配置部分
 		* @watchs   [watchItem,watchItem,...]
		*    这是工程对所有资源文件的操作配置,数组中的每个元素代表一个监控对象配置对象(目录),每个watchItem监控对象最终都会进行拷贝工作到发布目录,具体结构如下:
		*    {
 		*		// 监控对象的类型,目前系统支持:js|css|html|image|other几种内置默认类型.除了other外每种类型都有自己的actions,other没有对应的action,只会平移复制.
		*		type:'js',
		*		// 监控目录数组,相对于工作目录(workspace)
		*		paths:['assets/js'],
		*		// 监控目录中需要监控文件的后缀名数组
		*		exts:['js'],
		*		// 对监控目录进行的动作,执行顺序为: hint->concat->prefix->compress ,如果有一个出错则中断文件操作
		*		actions:{
		*
		*			/**
					*	>是否进行语法检查,默认false,该动作支持的类型有:js|css
		*			*	[js]	使用的是jshint插件, 当为true时使用相关工具的默认配置,{outSourceMap:false,compress:{unused:false}}
		*			*	[css]	使用的css插件的parse方法(参数slient程序中恒为true)
		*			*/
		*			hint:true|false|{options},
		*
		*			/**
		*			*	>是否压缩,默认false,该动作支持的类型有:js|css|html .
		*			*	[js]	使用的是uglifyjs,当为true时 使用的是默认的配置,个性化配置可参考uglifyjs(参数fromString程序中恒为true)
		*			*	[css]	使用的是clean-css插件,
		*			*	[html]	使用html-minifier插件,默认{collapseWhitespace: true,minifyJS:true,minifyCSS:true,relateurl:true,removeComments: true}
		*			*   [image] 使用imagemin-jpeg-recompress压缩jpg,imagemin-optipng压缩png,其它使用imagemin配置，内部默认调好了配置，也可以自己设置，方式略有不同，def为imagemin的配置，如果设置了jpg,png则默认配置失效，默认如下：
						{
							def:{
								interlaced:true,//隔行扫描gif进行渲染
								multipass:true,	//多次优化svg直到完全优化
								svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
							},
							jpg:{
								accurate: true,//高精度模式
						        quality: "high",//图像质量:low, medium, high and veryhigh;
						        method: "smallfry",//网格优化:mpe, ssim, ms-ssim and smallfry;
						        min: 80,//最低质量
						        loops: 0,//循环尝试次数, 默认为6;
						        progressive: false,//基线优化
						        subsample: "default"//子采样:default, disable;
							},
							png:{
								optimizationLevel: 4
							},
						}
		*			*/
		*			compress:true|false|{options},
		*
		*			/**
		*			* >自动为代码增加浏览器私有前缀 仅支持:css
		*			* [css]		使用autoprefixer插件, 具体参数参考autoprefixer插件. 数据来源参考can i use
		*			*/
		*			prefix:false|true|[options],
		*
		*			/** 合并文件夹操作,该动作支持的类型有:js|css|html|other.
		*			* 值为合并后的文件路径名(,相对于工作目录workspace),系统将在需要合并的目录同级生成生成目标文件(按名称排序),如不需合并则设为false
		*			*/
		*			concat:'assets/js/all.js',
		*		},
		*		// 是否按照以上规则递归处理子目录,默认false
		*		depth:false,
		*    }
 		*
 		* ******测试部分暂未实现，预留
 		* @main  入口html页面,测试需要知道入口。
 		* @port	工程测试服务端口
 		*/
		module.exports = {
			name:'示例工程',
			ename:'scv-demo',
			description:'scv工程流模板工程',
			// *目录配置
			workSpace:'workspace',
			releaseSpace:'release',
			// *资源文件配置
			watchs:[{
					type:'js',
					path:['assets/js'],
					exts:['js'],
					actions:{
						concat:'all.js',
						compress:{mangle:true},
						hint:{unused:true}
					},
					depth:false,
				},{
					type:'css',
					path:['assets/css'],
					exts:['css'],
					actions:{
						concat:false,
						compress:true,
						hint:true
					},
					depth:true,
				},{
					type:'other',
					path:['assets/image'],
					exts:['png','jpg','gif'],
					actions:{
						compress:true
					},
					depth:true,
				},{
					type:'html',
					path:['html'],
					exts:['html','tpl'],
					actions:{
						concat:false,
						compress:false,
						hint:true
					},
					depth:true,
				}
			]
		};

