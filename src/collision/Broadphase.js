var vec2 = require('../math/vec2');
var Body = require('../objects/Body');

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
     * @readOnly
     */
    this.world = null;

    /**
     * The bounding volume type to use in the broadphase algorithms. Should be set to Broadphase.AABB or Broadphase.BOUNDING_CIRCLE.
     * @property {Number} boundingVolumeType
     */
    this.boundingVolumeType = Broadphase.AABB;
}

/**
 * Axis aligned bounding box type.
 * @static
 * @property {Number} AABB
 */
Broadphase.AABB = 1;

/**
 * Bounding circle type.
 * @static
 * @property {Number} BOUNDING_CIRCLE
 */
Broadphase.BOUNDING_CIRCLE = 2;

/**
 * Set the world that we are searching for collision pairs in.
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
Broadphase.prototype.getCollisionPairs = function(world){};

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
    return bodyA.getAABB().overlaps(bodyB.getAABB());
};

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.prototype.boundingVolumeCheck = function(bodyA, bodyB){
    var result;

    switch(this.boundingVolumeType){
    case Broadphase.BOUNDING_CIRCLE:
        result =  Broadphase.boundingRadiusCheck(bodyA,bodyB);
        break;
    case Broadphase.AABB:
        result = Broadphase.aabbCheck(bodyA,bodyB);
        break;
    default:
        throw new Error('Bounding volume type not recognized: '+this.boundingVolumeType);
    }
    return result;
};

/**
 * Check whether two bodies are allowed to collide at all.
 * @method  canCollide
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.canCollide = function(bodyA, bodyB){
    var KINEMATIC = Body.KINEMATIC;
    var STATIC = Body.STATIC;

    // Cannot collide static bodies
    if(bodyA.type === STATIC && bodyB.type === STATIC){
        return false;
    }

    // Cannot collide static vs kinematic bodies
    if( (bodyA.type === KINEMATIC && bodyB.type === STATIC) ||
        (bodyA.type === STATIC    && bodyB.type === KINEMATIC)){
        return false;
    }

    // Cannot collide kinematic vs kinematic
    if(bodyA.type === KINEMATIC && bodyB.type === KINEMATIC){
        return false;
    }

    // Cannot collide both sleeping bodies
    if(bodyA.sleepState === Body.SLEEPING && bodyB.sleepState === Body.SLEEPING){
        return false;
    }

    // Cannot collide if one is static and the other is sleeping
    if( (bodyA.sleepState === Body.SLEEPING && bodyB.type === STATIC) ||
        (bodyB.sleepState === Body.SLEEPING && bodyA.type === STATIC)){
        return false;
    }

    return true;
};

Broadphase.NAIVE = 1;
Broadphase.SAP = 2;
