var vec2 = require('../math/vec2');
var Ray = require('../collision/Ray');

module.exports = RaycastResult;

/**
 * Storage for Ray casting hit data.
 * @class RaycastResult
 * @constructor
 */
function RaycastResult(){

	/**
	 * The normal of the hit, oriented in world space.
	 * @property {array} normal
	 */
	this.normal = vec2.create();

	/**
	 * The hit shape, or null.
	 * @property {Shape} shape
	 */
	this.shape = null;

	/**
	 * The hit body, or null.
	 * @property {Body} body
	 */
	this.body = null;

	/**
	 * The index of the hit triangle, if the hit shape was indexable.
	 * @property {number} faceIndex
	 * @default -1
	 */
	this.faceIndex = -1;

	/**
	 * Distance to the hit, as a fraction. 0 is at the "from" point, 1 is at the "to" point. Will be set to -1 if there was no hit yet.
	 * @property {number} fraction
	 * @default -1
	 */
	this.fraction = -1;

	/**
	 * If the ray should stop traversing.
	 * @readonly
	 * @property {Boolean} isStopped
	 */
	this.isStopped = false;
}

/**
 * Reset all result data. Must be done before re-using the result object.
 * @method reset
 */
RaycastResult.prototype.reset = function () {
	vec2.set(this.normal, 0, 0);
	this.shape = null;
	this.body = null;
	this.faceIndex = -1;
	this.fraction = -1;
	this.isStopped = false;
};

/**
 * Get the distance to the hit point.
 * @method getHitDistance
 * @param {Ray} ray
 */
RaycastResult.prototype.getHitDistance = function (ray) {
	return vec2.distance(ray.from, ray.to) * this.fraction;
};

/**
 * Returns true if the ray hit something since the last reset().
 * @method hasHit
 */
RaycastResult.prototype.hasHit = function () {
	return this.fraction !== -1;
};

/**
 * Get world hit point.
 * @method getHitPoint
 * @param {array} out
 * @param {Ray} ray
 */
RaycastResult.prototype.getHitPoint = function (out, ray) {
	vec2.lerp(out, ray.from, ray.to, this.fraction);
};

/**
 * Can be called while iterating over hits to stop searching for hit points.
 * @method stop
 */
RaycastResult.prototype.stop = function(){
	this.isStopped = true;
};

/**
 * @method shouldStop
 * @private
 * @param {Ray} ray
 * @return {boolean}
 */
RaycastResult.prototype.shouldStop = function(ray){
	return this.isStopped || (this.fraction !== -1 && ray.mode === Ray.ANY);
};

/**
 * @method set
 * @private
 * @param {array} normal
 * @param {Shape} shape
 * @param {Body} body
 * @param {number} fraction
 */
RaycastResult.prototype.set = function(
	normal,
	shape,
	body,
	fraction,
	faceIndex
){
	vec2.copy(this.normal, normal);
	this.shape = shape;
	this.body = body;
	this.fraction = fraction;
	this.faceIndex = faceIndex;
};