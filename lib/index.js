/**
 * 本组件是scv核心方法类,提供类似gulp的核心方法,使用方法也可参考gulp的api文档
 * 本来只是参考gulp的方法,结果最终越写越像gulp,唯一不同的就是没有使用
 * 借助vinyl-fs实现入口和输入文件. 所以流传输过程中的文件是vinyl-fs格式
 *
 */
var util = require('util');
var vfs = require('vinyl-fs');
var Orchestrator = require('orchestrator');
var deprecated = require('deprecated');

function Scv(){
  this.version = '2.2.5';
}

//任务流使用orchestrator实现,并没有像gulp一样直接继承并重指向为task方法. 而是将orchestrator实例直接赋到task属性上.
//由task属性对外提供add, start等方法.具体使用方法可参考orchestrator的文档.
Scv.prototype.task = new Orchestrator();

/**
 * 增加同步执行任务方法
 * 上一个任务的结束取决于task_stop事件, 可在设计任务的时候,在逻辑中调用任务的callback函数告诉引擎你的任务真正结束了
 * 例如:orchestrator.add('one', function (cb) {cb(err); });  //调用cb表示任务完成
 * @param  {array} tasks 要执行的任务数组,不设置的话默认为所有任务列表
 */
Scv.prototype.task.startQueue = function(tasks){
	if (typeof tasks == 'undefined') {
		tasks = [];
		for (var k in this.tasks) {
			tasks.push(k);
		}
	}
	var next = function(){
		if (tasks.length>0) {
			this.start(tasks.shift());
		}
	}.bind(this);

	this.on('task_stop',next);
	next();
};
/**
 * 该方法借助vinyl-fs为scv程式提供需要处理的文件,为工作流的入口方法
 * 使用方法参考 vinyl-fs或者gulp.src
 */
Scv.prototype.src = vfs.src;
/**
 * 将修改过的文件输出到目标目录
 * 使用方法参考 vinyl-fs或者gulp.dest
 */
Scv.prototype.dest = vfs.dest;

/**
 * watch 不再实现,推荐使用gulp-watch插件
 */
Scv.prototype.watch = deprecated.method('scv.watch()已经被弃用,建议使用gulp-watch插件来代替',
  console.warn,
  Scv.prototype.watch
);
// output
module.exports = new Scv();