var vec2 = require('../math/vec2');

module.exports = RaycastResult;

/**
 * Storage for Ray casting result data.
 * @class RaycastResult
 * @constructor
 */
function RaycastResult(){

	/**
	 * The ray start point in world space.
	 * @property {array} rayFromWorld
	 */
	this.rayFromWorld = vec2.create();

	/**
	 * Ray end point in world space.
	 * @property {array} rayToWorld
	 */
	this.rayToWorld = vec2.create();

	/**
	 * The normal of the hit, oriented in world space.
	 * @property {array} hitNormalWorld
	 */
	this.hitNormalWorld = vec2.create();

	/**
	 * The hit point in world space.
	 * @property {array} hitPointWorld
	 */
	this.hitPointWorld = vec2.create();

	/**
	 * Indicates whether the ray hit something.
	 * @property {boolean} hasHit
	 */
	this.hasHit = false;

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
	 * @property {number} hitFaceIndex
	 * @default -1
	 */
	this.hitFaceIndex = -1;

	/**
	 * Distance to the hit. Will be set to -1 if there was no hit.
	 * @property {number} distance
	 * @default -1
	 */
	this.distance = -1;

	/**
	 * If the ray should stop traversing the bodies.
	 * @private
	 * @property {Boolean} _shouldStop
	 * @default false
	 */
	this._shouldStop = false;
}

/**
 * Reset all result data. Must be done before re-using the result object.
 * @method reset
 */
RaycastResult.prototype.reset = function () {
	vec2.set(this.rayFromWorld, 0, 0);
	vec2.set(this.rayToWorld, 0, 0);
	vec2.set(this.hitNormalWorld, 0, 0);
	vec2.set(this.hitPointWorld, 0, 0);
	this.hasHit = false;
	this.shape = null;
	this.body = null;
	this.hitFaceIndex = -1;
	this.distance = -1;
	this._shouldStop = false;
};

/**
 * Can be called while iterating over hits to stop searching for hit points.
 * @method abort
 */
RaycastResult.prototype.abort = function(){
	this._shouldStop = true;
};

/**
 * @method set
 * @param {array} rayFromWorld
 * @param {array} rayToWorld
 * @param {array} hitNormalWorld
 * @param {array} hitPointWorld
 * @param {Shape} shape
 * @param {Body} body
 * @param {number} distance
 */
RaycastResult.prototype.set = function(
	rayFromWorld,
	rayToWorld,
	hitNormalWorld,
	hitPointWorld,
	shape,
	body,
	distance
){
	vec2.copy(this.rayFromWorld, rayFromWorld);
	vec2.copy(this.rayToWorld, rayToWorld);
	vec2.copy(this.hitNormalWorld, hitNormalWorld);
	vec2.copy(this.hitPointWorld, hitPointWorld);
	this.shape = shape;
	this.body = body;
	this.distance = distance;
};