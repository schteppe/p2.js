var vec2 = require('../math/vec2')
var Body = require('../objects/Body')

module.exports = Broadphase;

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
function Broadphase(type){

    this.type = type;

    /**
     * The resulting overlapping pairs. Will be filled with results during .getCollisionPairs().
     * @property result
     * @type {Array}
     */
    this.result = [];

    /**
     * The world to search for collision pairs in. To change it, use .setWorld()
     * @property world
     * @type {World}
     */
    this.world = null;
};

/**
 * Set the world that we are searching for collision pairs in
 * @method setWorld
 * @param  {World} world
 */
Broadphase.prototype.setWorld = function(world){
    this.world = world;
};

/**
 * Get all potential intersecting body pairs.
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
Broadphase.prototype.getCollisionPairs = function(world){
    throw new Error("getCollisionPairs must be implemented in a subclass!");
};

var dist = vec2.create();

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.boundingRadiusCheck = function(bodyA, bodyB){
    vec2.sub(dist, bodyA.position, bodyB.position);
    var d2 = vec2.squaredLength(dist),
        r = bodyA.boundingRadius + bodyB.boundingRadius;
    return d2 <= r*r;
};

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.aabbCheck = function(bodyA, bodyB){
    if(bodyA.aabbNeedsUpdate) bodyA.updateAABB();
    if(bodyB.aabbNeedsUpdate) bodyB.updateAABB();
    return bodyA.aabb.overlaps(bodyB.aabb);
};

/**
 * Check whether two bodies are allowed to collide at all.
 * @method  canCollide
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.canCollide = function(bodyA, bodyB){

    // Cannot collide static bodies
    if(bodyA.motionState == Body.STATIC && bodyB.motionState == Body.STATIC)
        return false;

    // Cannot collide static vs kinematic bodies
    if( (bodyA.motionState == Body.KINEMATIC && bodyB.motionState == Body.STATIC) ||
        (bodyA.motionState == Body.STATIC    && bodyB.motionState == Body.KINEMATIC))
        return false;

    // Cannot collide kinematic vs kinematic
    if(bodyA.motionState == Body.KINEMATIC && bodyB.motionState == Body.KINEMATIC)
        return false;

    // Cannot collide both sleeping bodies
    if(bodyA.sleepState == Body.SLEEPING && bodyB.sleepState == Body.SLEEPING)
        return false;

    return true;
};

Broadphase.NAIVE = 1;
Broadphase.SAP = 2;
