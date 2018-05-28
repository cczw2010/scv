/**
 * scv模板模块
 */
const fs = require('fs');
const path = require('path');
const sutil = require('./sutil.js');

// 对外提供接口
module.exports = function(){
	// 获取当前目录的scv工程信息
	let spinfo = sutil.getSPInfo();
	if (!spinfo) {
		sutil.error('不是有效的scv工程目录,请先初始化:scv init [template name]');
		return;
	}
  // 列表
  if (this.list) {
    sutil.log('scv默认工程模板列表：');
    list();
    return;
  }
  // 保存
  if (this.save) {
    let workPath = process.cwd();
    if (!sutil.getSPInfo()) {
      sutil.error('当前目录不是有效地scv默认工程目录,请在共目录执行:scv init [temp name]');
      return;
    }
    save(this.save,workPath);
    return;
  }
  // 删除
  if (this.delete) {
    let tempName = this.delete;
    del(tempName);
    return;
  }
  this.outputHelp();
}
/**
 * 删除模板
 * @param  {string} tempName 模板名称
 */
function del(tempName){
	if (tempName=='default') {
		sutil.error('default模板不允许删除！');
		return;
	}
	let tempPath = path.join(process.env.tempPath,tempName);
	let exits = fs.existsSync(tempPath);
	if (!exits) {
		sutil.error('工程模板不存在！');
		return;
	}
	sutil.log('模板删除中...');
	sutil.delDir(tempPath);
	sutil.log('sucess');
};
/**
 * 保存模板
 * @param  {string} tempName 模板名称
 */
function save(tempName){
	// 检查模板名称是否存在
	let tempPath = path.join(process.env.tempPath,tempName);
	let exits = fs.existsSync(tempPath);
	if (exits) {
		sutil.error('错误,模板名称已经存在！');
		return;
	}
	sutil.log("保存模板:%s", tempName);
	sutil.copyDir(process.cwd(),tempPath);
	sutil.log('success');
};

/**
 * 列出工程模板列表
 */
function list(){
	fs.readdir(process.env.tempPath, function(err, paths) {
		if (err) {
			throw err;
		}
		paths.forEach(function(p) {
			fs.stat(path.join(process.env.tempPath,p),function(err,stat){
				if (!err && stat.isDirectory(p)) {
					sutil.log('> '+p);
				}
			});
		});
	});
};
