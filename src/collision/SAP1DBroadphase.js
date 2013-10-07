var Circle = require('../shapes/Circle')
,   Plane = require('../shapes/Plane')
,   Shape = require('../shapes/Shape')
,   Particle = require('../shapes/Particle')
,   Broadphase = require('../collision/Broadphase')
,   vec2 = require('../math/vec2')

module.exports = SAP1DBroadphase;

/**
 * Sweep and prune broadphase along one axis.
 *
 * @class SAP1DBroadphase
 * @constructor
 * @extends Broadphase
 */
function SAP1DBroadphase(world){
    Broadphase.apply(this);
    var axisList = this.axisList = world.bodies.slice(0);
    this.world = world;
    this.sortFunction = SAP1DBroadphase.sortAxisListX;

    world.on("addBody",function(e){
        axisList.push(e.body);
    }).on("removeBody",function(e){
        var idx = axisList.indexOf(e.body);
        if(idx !== -1)
            axisList.splice(idx,1);
    })
};
SAP1DBroadphase.prototype = new Broadphase();

SAP1DBroadphase.sortAxisListX = function(bodyA,bodyB){
    return (bodyA.position[0]-bodyA.boundingRadius) - (bodyB.position[0]-bodyB.boundingRadius);
};

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
SAP1DBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = this.axisList,
        result = [];

    // Sort the list
    bodies.sort(this.sortFunction);

    // Look through the list
    for(var i=0, N=bodies.length; i!==N; i++){
        var bi = bodies[i];

        for(var j=i+1; j<N; j++){
            var bj = bodies[j],
                boundA1 = bi.position[0]-bi.boundingRadius,
                boundA2 = bi.position[0]+bi.boundingRadius,
                boundB1 = bj.position[0]-bj.boundingRadius,
                boundB2 = bj.position[0]+bj.boundingRadius;

            // Abort if we got gap til the next body
            if( boundB1 > boundA2 ){
                break;
            }

            // If we got overlap, add pair
            if(Broadphase.boundingRadiusCheck(bi,bj))
                result.push(bi,bj);
        }
    }

    return result;
};
