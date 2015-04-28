#SCV简介

  任何一个前端团队都需要一个整体的开发体系，前期可能是借鉴现有成熟方案，但是随着时间的变化和成员长期的磨合必然会逐渐的开发并完善自己的前端集成解决方案，英文翻译为 Front-end Integrated Solution，缩写fis。
  
  SCV名字借鉴了星际中的太空工程车，宗旨在建立一个简单的工作流，尽可能的为开发者解决web应用开发前期工程部署以及后期版本更新升级过程中遇到的各种繁琐问题，让程序员更多的精力用在实际的开发上去。
  
  目前类似框架也有很多，比较出名的有：google的[yeoman](http://yeoman.io/)(包括yo（脚手架工具）、grunt（构建工具）、bower（包管理器）、PhantomJS（单元测试）四部分组成），社区比较成熟，用的也比较多，已经很强大了。不过貌似不太关心升级维护部分的功能，比如资源文件版本更新.还有比较亲民的百度框架[FIS](http://fis.baidu.com/)，工作流已经实现的非常完善了.其他的构建工具还有gulp,fez等。

##开始之前

 一个前端工程除了开发之外还有一堆让你头疼的问题，比如创建一个干净的工程（或者自己常用的一套工程模板），统一的目录，命名，代码规范（多人协作），模块化开发，检查js,css的语法检查，合并和压缩资源，js,css资源文件变化时更新资源文件版本，各种js库的版本管理，效果测试等等各种问题。这些在前段工程的开发中占据了大量的时间精力，一不小心就会出错，上线发布时更是要慎之又慎。这些其实每个问题都有几个成熟的工具可以使用，但是如何让他们糅合在一起就是集成解决方案要做的实情了。
 
 值得一提的是，scv不支持haml,coffee script,sass,styles,less等一些华丽外衣，无他，作者本人厌恶任何第三方封装语言，简直就是语言的掘墓者，让人越来越傻。

 现在大概构思一下，工具环境当然使用nodejs,多人协作可以借助于git,js库版本管理可以用bower,工程流资源处理用gulp，测试可以借助于phantomjs，CasperJS，资源文件发布版本管理可以使用文件的数字摘要算法（gulp-md5-plus | gulp-md5-assets）。
 
##关于模块化开发

  SCV是不强制给开发者订立开发规范的，但是还是建议大家按照一定的规范来开发。比如前端模块开发规范（**CMD**|**AMD**）。这个目前是比较流行的了，对于提升一定的big还是有点用处的。
 
##如何使用

 我希望是这个样子的：
 
 	#创建工程
	mkdir test		#创建工程目录
	cd test			#进入工程目录
	scv init 		#初始化工程（按照约定规范生成目录，并启动工程监控）
	#scv init test	#或者按照模板初始化新工程

	#停止gulp服务
	scv server -s
	
	#停止gulp服务
	scv server -S
	
	#重启gulp服务
	scv server -r

	#查看gulp服务状态
	scv server -i
	
	#测试工程，直接运行
	scv test
	
	#生成模板，将当前工程保存为模板，初始化新工程时可以使用该模板初始化
	scv template test
	
	#查看模板列表
	scv template -l

	#发布工程,自动生成资源文件版本，如果版本存在会询问是否覆盖，并记录每次发布版本的一些信息。便于查询
	scv release

	#版本发布记录
	scv log
	
 当然后期可能我还想直接打包android和ios应用，初步计划集成cordova，放在下个版本实现。
	
##目录规范

 目录自然要定制规范，下面就是一个工程的基本目录，当然除了开发者实际开发的文件，目录都是自动创建的：

	 工程目录
	 	|--assets（资源根目录）
	 	|	|--src(开发者源码目录，开发者在此目录开发，SCV将实时监控并自动处理到上级同名目录)
	 	|	|		|--js
	 	|	|  	|	|--index(js组合文件夹，每个html页对应一个文件夹,内部所有js将合并以个文件)
	 	|	|  	|	| 	|--top.js
	 	|	|  	|	|  	|--main.js
	 	|	|  	|	|  	|--...
	 	|	|  	|	|--common.src.js(js源码文件，一个文件对应上级同名目录中的一个文件)
	 	|	|		|	|--...
	 	|	|		|--css
	 	|	|  	|	|--index(css组合文件，每个html页对应一个文件夹,内部所有css将合并以个文件)
	 	|	|  	|	| 	|--top.css
	 	|	|  	|	|  	|--main.css
	 	|	|  	|	|  	|--...
	 	|	|  	|	|--common.src.css(css源码文件，一个文件对应上级同名目录中的一个文件)
	 	|	|		|	|--...
	 	|	|  	|--image（子文件夹不合并,只进行压缩操作，同步到上级同名目录中）
	 	|	|  	|		|--sprites.png
	 	|	|  	|		|--...
		|	|--js	
	 	|	|		|--index.js
	 	|	|		|--common.js
	 	|	|		|--...
	 	|	|--css	
	 	|	|		|--index.css
	 	|	|		|--common.css
	 	|	|		|--...
	 	| |--image
	 	| |		|--sprites.png
	 	| |		|--...
	 	|--html(静态页目录)
	 	|	|--src(开发者源码目录每个文件对应上级同名目录下一个文件)
	 	|	|	|--index.html
	 	|	|	|--user
	 	|	|	|	|--center.html
	 	|	|	|	|--
	 	|	|	|--...
	 	|	|--index.html
	 	|	|--user
	 	|	|		|--center.html
	 	|	|		|--...	 	
	 	|	|--...
	 	|--release(发布目录)
	 	|	|--v1
		|	|	|--assets(内部资源文件名称全部是带md5版本号的)
	 	|	|	|	|--js
	 	|	|	|	|--css
	 	|	|	|	|--image
	 	|	|	|	|--json
		|	|	|--html
		|	|--v2
		|	|--... 	
	 	|--config.js


>**condig.js**是app配置文件，这个需要用户维护一些应用基本信息

>**html**文件夹是静态文件，内部有一个*src*文件夹是开发者开发目录,新建修改都在此，*src*内部所有的文件都会被压缩等处理后同步到*html*根目录下的同名目录。在开发者目录下开发者可以用自己喜欢的任何友好的格式开发代码。

>**assets**资源文件目录，内部同样有一个*src*文件夹作为开发者开发目录，*src*内部包含*js*|*css*|*image*|*json*目录，同样内部所有资源都会同步到对应*assets*根目录下的同名目录。

>**release**版本发布目录,发布一次这里生成一个版本文件夹，内部是实际可发布的app文件集合.

>由此可见，从上面的结构来说，基本上开发者只需要在**html**文件的**src**目录和**assets**目录的**src**目录下开发就可以了。当然额外的你只需要配置一个**config.js**文件来告诉工程你的入口html文件就可以了。
  
  
###config配置

>下面是一个完整的config配置文件：


		/**
		 * 工程配置
		 * @name 应用名称
		 * @ename 应用英文名称
		 * @descriptyion  应用描述
		 * @version  应用版本,每次release生成的版本名称也是依据此处，请使用三段版本
		 * @watch 工程需要处理的目录，包括js|css|image|html	
		 * 
		 * @main  入口html页面,测试需要知道入口。
		 * @port	工程测试服务端口
		 * 
		 * @release  发布目录的相对路径，这里相对的是scv根目录
		 * @assetsDomain 资源文件发布时的前置域名，比如要发布到cdn：http://cdn.xxx.com/img/,默认空表示相对路径
		 */
		var Config = {
			name:'示例工程',
			ename:'scv-demo',
			description:'scv工程流模板工程',
			version:'1.0.0',
			watch:['js','css','image','html'],
			// 测试参数
			main:'html/index.html',
			port:8001,
			//发布参数
			release:'release',
			assetsDomain:{
					'js':'',	// http://cdn.xxx.com/js/
					'css':'',	//http://css.xxx.com/xx/
					'image':'',
				},
		};
  

  
  
  
  
  
  
  
  
  
  
  
	 	