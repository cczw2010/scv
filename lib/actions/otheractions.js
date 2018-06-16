module.exports = otherActions;

/**
 * 其他类型，啥都不干
 */
function otherActions(actions){
	return function (file, encoding, cb) {
		// 不合并的话就将文件流向下一个操作
		cb(null,file);
	};
}
