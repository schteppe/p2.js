var Constraint = require('./Constraint').Constraint
,   ContactEquation = require('./ContactEquation').ContactEquation
,   vec2 = require('../math/vec2')

exports.DistanceConstraint = DistanceConstraint;

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @class DistanceConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {number} dist The distance to keep between the bodies.
 * @param {number} maxForce
 */
function DistanceConstraint(bodyA,bodyB,distance,maxForce){
    Constraint.call(this,bodyA,bodyB);

    this.distance = distance;

    if(typeof(maxForce)==="undefined" ) {
        maxForce = 1e6;
    }

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new ContactEquation(bodyA,bodyB), // Just in the normal direction
    ];

    var normal = eqs[0];

    // Make the contact constraint bilateral
    normal.minForce = -maxForce;
    normal.maxForce =  maxForce;

}

DistanceConstraint.prototype = new Object(Constraint.prototype);

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 */
DistanceConstraint.prototype.update = function(){
    var normal = this.equations[0],
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        distance = this.distance;

    vec2.subtract(normal.ni, bodyB.position, bodyA.position);
    vec2.normalize(normal.ni,normal.ni);
    vec2.scale(normal.ri, normal.ni,  distance*0.5);
    vec2.scale(normal.rj, normal.ni, -distance*0.5);
};

