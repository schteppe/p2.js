import Circle from '../shapes/Circle';
import Plane from '../shapes/Plane';
import Shape from '../shapes/Shape';
import Particle from '../shapes/Particle';
import Broadphase from '../collision/Broadphase';
import vec2 from '../math/vec2';

export default NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.call(this, Broadphase.NAIVE);
}
NaiveBroadphase.prototype = new Broadphase();

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = world.bodies,
        result = this.result;

    result.length = 0;

    for(var i=0, Ncolliding=bodies.length; i!==Ncolliding; i++){
        var bi = bodies[i];

        for(var j=0; j<i; j++){
            var bj = bodies[j];

            if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                result.push(bi,bj);
            }
        }
    }

    return result;
};
