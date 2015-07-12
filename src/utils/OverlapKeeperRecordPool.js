var OverlapKeeperRecord = require('./OverlapKeeperRecord');
var Pool = require('./Pool');

module.exports = OverlapKeeperRecordPool;

/**
 * @class
 */
function OverlapKeeperRecordPool() {
	Pool.apply(this, arguments);
}
OverlapKeeperRecordPool.prototype = new Pool();
OverlapKeeperRecordPool.prototype.constructor = OverlapKeeperRecordPool;

/**
 * @method create
 * @return {OverlapKeeperRecord}
 */
OverlapKeeperRecordPool.prototype.create = function () {
	return new OverlapKeeperRecord();
};

/**
 * @method destroy
 * @param {OverlapKeeperRecord} record
 * @return {OverlapKeeperRecordPool}
 */
OverlapKeeperRecordPool.prototype.destroy = function (record) {
	record.bodyA = record.bodyB = record.shapeA = record.shapeB = null;
	return this;
};
