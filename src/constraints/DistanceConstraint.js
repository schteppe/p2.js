var Constraint = require('./Constraint')
,   Equation = require('../equations/Equation')
,   vec2 = require('../math/vec2')

module.exports = DistanceConstraint;

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @class DistanceConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {number} distance The distance to keep between the bodies.
 * @param {object} [options]
 * @param {object} [options.maxForce=Number.MAX_VALUE] Maximum force to apply.
 * @extends Constraint
 */
function DistanceConstraint(bodyA,bodyB,distance,options){
    options = options || {};

    Constraint.call(this,bodyA,bodyB,Constraint.DISTANCE,options);

    /**
     * The distance to keep.
     * @property distance
     * @type {Number}
     */
    this.distance = distance;

    var maxForce;
    if(typeof(options.maxForce)==="undefined" ){
        maxForce = Number.MAX_VALUE;
    } else {
        maxForce = options.maxForce;
    }

    var normal = new Equation(bodyA,bodyB,-maxForce,maxForce); // Just in the normal direction
    this.equations = [ normal ];

    var r = vec2.create();
    normal.computeGq = function(){
        vec2.sub(r, bodyB.position, bodyA.position);
        return vec2.length(r)-distance;
    };

    // Make the contact constraint bilateral
    this.setMaxForce(maxForce);
}
DistanceConstraint.prototype = new Constraint();

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 * @method update
 */
var n = vec2.create();
DistanceConstraint.prototype.update = function(){
    var normal = this.equations[0],
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        distance = this.distance,
        G = normal.G;

    vec2.sub(n, bodyB.position, bodyA.position);
    vec2.normalize(n,n);
    G[0] = -n[0];
    G[1] = -n[1];
    G[3] =  n[0];
    G[4] =  n[1];
};

/**
 * Set the max force to be used
 * @method setMaxForce
 * @param {Number} f
 */
DistanceConstraint.prototype.setMaxForce = function(f){
    var normal = this.equations[0];
    normal.minForce = -f;
    normal.maxForce =  f;
};

/**
 * Get the max force
 * @method getMaxForce
 * @return {Number}
 */
DistanceConstraint.prototype.getMaxForce = function(f){
    var normal = this.equations[0];
    return normal.maxForce;
};
