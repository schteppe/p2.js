var Circle = require('../shapes/Circle')
,   Plane = require('../shapes/Plane')
,   Shape = require('../shapes/Shape')
,   Particle = require('../shapes/Particle')
,   Broadphase = require('../collision/Broadphase')
,   vec2 = require('../math/vec2')

module.exports = NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.apply(this);

    /**
     * Set to true to use bounding box checks instead of bounding radius.
     * @property useBoundingBoxes
     * @type {Boolean}
     */
    this.useBoundingBoxes = false;
};
NaiveBroadphase.prototype = new Broadphase();

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = world.bodies,
        result = this.result,
        i, j, bi, bj,
        check = this.useBoundingBoxes ? Broadphase.aabbCheck : Broadphase.boundingRadiusCheck;

    result.length = 0;

    for(i=0, Ncolliding=bodies.length; i!==Ncolliding; i++){
        bi = bodies[i];

        for(j=0; j<i; j++){
            bj = bodies[j];

            if(check(bi,bj))
                result.push(bi,bj);
        }
    }

    return result;
};
