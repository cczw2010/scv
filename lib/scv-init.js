/**
 * scv默认工程初始化
 */

const sutil = require('./sutil');
const path = require('path');
const fs = require('fs');

module.exports = function(tempName){
	// 获取当前目录的Scv工程信息
	let spinfo = sutil.getSPInfo();
	if (spinfo) {
		sutil.log('该目录已经被初始化: scv-version:',spinfo.scvVersion,'; template:',spinfo.tempName);
		return;
	}
	sutil.log('Scv工程初始化...');
	if(copy(tempName)){
		// 保存工程信息
		sutil.initSPInfo(tempName);
		sutil.log('success');
	}
}

/**
 * 拷贝模板到当前目录，要求再空Scv目录下执行
 * @param  {string} tempName 模板名称
 */
function copy(tempName) {
	// 检查当模板是否存在
	tempName = tempName||'default';
	let tempPath = path.join(process.env.tempPath,tempName);
	let exits = fs.existsSync(tempPath);
	if (!exits) {
		sutil.log('工程模板不存在:',tempName);
		return false;
	}
	// 拷贝模板初始化工程
	sutil.log("拷贝模板:%s", tempName);
	sutil.copyDir(tempPath, process.cwd());
	return true;
};