// 工程配置文件
module.exports = {
		name:'示例工程',
		ename:'scv-demo',
		description:'scv前端工程自动化demo',
		// *测试参数
		// main:'html/index.html',
		// port:8001,
		// *目录配置
		workSpace:'workspace',
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
			},{
				type:'html',
				paths:['html'],
				exts:['html','tpl'],
				actions:{
					compress:true,
					concat:'html/all.html'
				},
				depth:true,
			},{
				type:'image',
				paths:['assets/image'],
				exts:['jpg','gif','png'],
				actions:{
					compress:true
				},
				depth:true,
			}
		]
	};