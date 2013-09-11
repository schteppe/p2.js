var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    vec2 = require('../math/vec2');

exports.NaiveBroadphase = NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.apply(this);
};
NaiveBroadphase.prototype = new Broadphase();

/**
 * Get the colliding pairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var collidingBodies = world.bodies;
    var result = [];
    for(var i=0, Ncolliding=collidingBodies.length; i!==Ncolliding; i++){
        var bi = collidingBodies[i];
        var si = bi.shape;
        if (si === undefined) continue;
        for(var j=0; j!==i; j++){
            var bj = collidingBodies[j];
            var sj = bj.shape;
            if (sj === undefined) {
                continue;

            } else if(si instanceof Circle){
                     if(sj instanceof Circle)   bp.checkCircleCircle  (bi,bj,result);
                else if(sj instanceof Particle) bp.checkCircleParticle(bi,bj,result);
                else if(sj instanceof Plane)    bp.checkCirclePlane   (bi,bj,result);

            } else if(si instanceof Particle){
                     if(sj instanceof Circle)   bp.checkCircleParticle(bj,bi,result);
                else if(sj instanceof Plane)    bp.checkParticlePlane (bi,bj,result);

            } else if(si instanceof Plane){
                     if(sj instanceof Circle)   bp.checkCirclePlane   (bj,bi,result);
                else if(sj instanceof Particle) bp.checkParticlePlane (bj,bi,result);

            }
        }
    }
    return result;
};
