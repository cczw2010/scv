#开始之前

  一个前端工程除了开发之外还有一堆让你头疼的问题，比如创建一个干净的工程（或者自己常用的一套工程模板），统一的目录，命名，代码规范（多人协作），模块化开发，检查js,css的语法检查，合并和压缩资源，js,css资源文件变化时更新资源文件版本，各种js库的版本管理，效果测试等等各种问题。这些在前段工程的开发中占据了大量的时间精力，一不小心就会出错，上线发布时更是要慎之又慎。这些其实每个问题都有几个成熟的工具可以使用，但是如何让他们糅合在一起就是集成解决方案要做的实情了。
  
  目前类似框架也有很多，比较出名的有：google的[yeoman](http://yeoman.io/)(包括yo（脚手架工具）、grunt（构建工具）、bower（包管理器）、PhantomJS（单元测试）四部分组成），社区比较成熟，用的也比较多，已经很强大了。不过貌似不太关心升级维护部分的功能，比如资源文件版本更新.还有比较亲民的百度框架[FIS](http://fis.baidu.com/)，工作流已经实现的非常完善了.其他的构建工具还有gulp,fez等。

#SCV简介

 SCV名字借鉴了星际中的太空工程车，宗旨在建立一个简单的工作流，尽可能的为开发者解决web应用开发前期工程部署以及后期版本更新升级过程中遇到的各种繁琐问题，让程序员更多的精力用在实际的开发上去。

 值得一提的是，scv不支持haml,coffee script,sass,styles,less等一些华丽外衣，无他，作者本人厌恶任何第三方封装语言，简直就是语言的掘墓者，让人越来越傻。如果给要用的话请自行修改源码，加上也是非常简单。

 工具环境当然使用nodejs,多人协作可以借助于git,js库版本管理可以用bower,工程流资源处理用gulp，测试可以借助于phantomjs，CasperJS，资源文件发布版本管理可以使用文件的数字摘要算法。另外部分gulp插件方法代码借鉴了[gulp-concat](https://www.npmjs.com/package/gulp-concat)和[gulp-md5-plus](https://github.com/wpfpizicai/gulp-md5-plus)
 
 针对平台：Mac OS,linux,`windows7(需要管理员权限运行cmd)`以上

##关于模块化开发

  SCV是不强制给开发者订立开发规范的，但是还是建议大家按照一定的规范来开发。比如前端模块开发规范（**CMD**|**AMD**）。这个目前是比较流行的了，对于提升一定的big还是有点用处的。


##如何使用

 我希望是这个样子的,所以就这个样子了：

 	#安装
 	npm install -g scv
	npm install -g gulp  #前期依然需要安装gulp，后期考虑合并
 
 	#创建工程
 	
	mkdir test		#创建工程目录
	cd test			#进入工程目录
	scv init 		#初始化工程（按照约定规范生成目录，并启动工程监控）
	#scv init test	#或者按照模板初始化新工程

	#停止gulp服务,服务启动后将占用控制台窗口以输出gulp工作流信息，用户可以在这里查看每次文件修改后scv的操作日志和代码错误以维护代码。用户可以通过`ctrl+c`中断服务
	scv server -s
	
	#停止gulp服务
	scv server -S
	
	#重启gulp服务,如果启动服务出现问题，可以使用该命令重启服务。
	scv server -r

	#查看gulp服务状态
	scv server -i
	
	#测试工程，直接运行
	scv test
	
	#生成模板，将当前工程保存为模板(mytmp)，初始化新工程时可以使用该模板初始化
	scv template -s mytmp
	
	#查看模板列表
	scv template -l

	#删除已有模板
	scv template -d mytmp

	#发布工程,自动生成资源文件版本，如果版本存在会询问是否覆盖，并记录每次发布版本的一些信息。便于查询
	scv release

	#当前发布记录
	scv release -l
	
 当然后期可能我还想直接打包android和ios应用，初步计划集成cordova，放在下个版本实现。
	
##目录规范

 目录自然要定制规范，下面就是一个工程的基本目录，当然除了开发者实际开发的文件，目录都是自动创建的，下面是一个默认的开发模板，js和css文件夹下的文件和目录是为开发示例说明建立的,非初始化模板内容。

	 工程目录
		|--workspace(工作区)
		|		|--assets（资源根目录）
		|		|		|--js
		|		|		|		|--index(包含scv.one文件，本目录下的文件将合并成一个与文件夹同名的文件)
		|		|		|		|		|--scv.one
		|		|		|		|		|--top.js
		|		|		|		|		|--main.js
		|		|		|		|		|--...
		|		|		|		|--other(不包含scv.one文件,不合并内部文件，保留文件夹)
		|		|		|		|		|--other1.js
		|		|		|		|		|--other2.js
		|		|		|		|--common.js(js源码文件，一个文件对应上级同名目录中的一个文件)
		|		|		|		|--...
		|		|		|--css
		|		|		|		|--index(包含scv.one文件的话，本目录下的文件将合并成一个与文件夹同名的文件)
		|		|		|		|		|--scv.one
		|		|		|		|		|--top.css
		|		|		|		|		|--main.css
		|		|		|		|		|--...
		|		|		|		|--common.css(css源码文件，一个文件对应上级同名目录中的一个文件)
		|		|		|		|--...
		|		|		|--image
		|		|		|		|--sprites.png
		|		|		|		|--...
		|		|--html(静态页目录)
		|		|		|--index.html
		|		|		|--user
		|		|		|		|--center.html
		|		|		|		|--...
		|		|		|--...
		|--tmp(暂存区)
		|		|--assets
		|		|		|--js	
		|		|		|		|--index.js
		|		|		|		|--common.js
		|		|		|		|--other
		|		|		|		|		|--other1.js
		|		|		|		|		|--other2.js
		|		|		|		|--...
		|		|		|--css	
		|		|		|		|--index.css
		|		|		|		|--common.css
		|		|		|		|--...
		|		|		|--image
		|		|		|		|--sprites.png
		|		|		|		|--...
		|		|--html
		|		|		|--index.html
		|		|		|--user
		|		|		|		|--center.html
		|		|		|		|--...		
		|		|		|--...
		|--release(版本发布区)
		|		|--v1.0.0
		|		|		|--assets(内部资源文件名称全部是带md5版本号的)
		|		|		|	|--js
		|		|		|	|--css
		|		|		|	|--image
		|		|		|	|--json
		|		|		|--html
		|		|--... 	
		|--config.js


>**condig.js**是app配置文件，这个需要用户维护一些应用基本信息

>**workspace**是工作区，用户在此开发，*assets*目录是存放资源文件的地方，js,css,image。
>**html**文件夹是静态html文件.`所有文件的后缀请使用小写！`

>开发区内部所有文件修改保存时都会自动同步到*tmp暂存区*对应目录下的同名目录。

>assets是被版本化管理的资源文件夹，其下的css和js源文件目录中的任意层级子文件夹里如果包含`scv.one`文件，那么该文件夹下所有的文件将按照**文件名排序**合并成一个与文件夹同名的文件，与该文件夹同级。需要注意一下亮点：【1】 拥有`scv.one`文件的文件夹请不要再有子文件夹了,另外建立要合并的文件夹时请`先创建scv.one文件`以防止scv实时对其内文件进行未合并处理。【2】html代码中引入拥有`scv.one`文件的文件夹资源时，引入的是与文件夹同名的js文件。对资源文件的具体操作如下：

>>css文件将自动增加css3浏览器私有前缀(依据[caniuse](http://caniuse.com/))，规则使用的是默认规则，具体意义可查看[browserslist](https://github.com/ai/browserslist)所以书写时请只写属性的标准写法即可

>>js文件将自动进行hint校验

>>image文件夹,本版本不再进行压缩处理,只是进行版本管理。

>html文件中的资源文件请使用`相对路径`,最终路径可在config文件中配置。文件也会进行压缩，并去除空白,但是不会处理SCRIPT, STYLE, PRE or TEXTAREA.中的有意义的空白。不处理CDATA(<!--*-->).

>`自定义目录`可能除了assets和html之外你还需要其他的目录来组建工程，可以在工程的config.js中设置

>**tmp**暂存区，内部文件与workspace保持一致，该目录是自动维护的，请不要修改

>**release**版本发布区,发布一次这里生成一个版本文件夹，自动维护资源文件版本，内部是实际可发布的app文件集合.

>由此可见，从上面的结构来说，基本上开发者只需要在**workspace**目录下按照目录规范来开发就可以了。当然额外的你只需要配置一个**config.js**文件，下面我们来详细介绍。
 

###config配置

>下面是一个完整的config配置文件：

		/**
 		* 工程配置
 		* @name 应用名称
 		* @ename 应用英文名称
 		* @descriptyion  应用描述
 		* @version  应用版本,每次release生成的版本名称也是依据此处，请使用三段版本
 		* @watch 	工程需要处理的目录，包括js|css|image|html	,image本版本不做压缩处理
 		* @watchExt 工程所需其他目录，路径相对于工程根目录，例如:tpl,php等，不作处理纯拷贝
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
			// 测试参数，暂未实现
			main:'html/index.html',
			port:8001,
			//发布参数
			release:'release',
			assetsDomain:{
					'js':'',	// http://cdn.xxx.com/js/
					'css':'',	//http://css.xxx.com/xx/
					'image':'',	//http://css.xxx.com/i/
				},
		};
