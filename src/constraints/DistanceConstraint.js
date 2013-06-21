var Constraint = require('./Constraint').Constraint
,   ContactEquation = require('./ContactEquation').ContactEquation
,   vec2 = require('gl-matrix').vec2

exports.DistanceConstraint = DistanceConstraint;

/**
 * @class p2.DistanceConstraint
 * @brief Constrains two bodies to be at a constant distance from each other.
 * @author schteppe
 * @param p2.Body bodyA
 * @param p2.Body bodyB
 * @param float distance
 * @param float maxForce
 */
function DistanceConstraint(bodyA,bodyB,distance,maxForce){
    Constraint.call(this,bodyA,bodyB);

    if(typeof(maxForce)==="undefined" ) {
        maxForce = 1e6;
    }

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new ContactEquation(bodyA,bodyB), // Just in the normal direction
    ];

    var normal = eqs[0];

    normal.minForce = -maxForce;
    normal.maxForce =  maxForce;

    // Update 
    this.update = function(){
        vec2.subtract(normal.ni, bodyB.position, bodyA.position); //bodyB.position.vsub(bodyA.position,normal.ni);
        vec2.normalize(normal.ni,normal.ni);//normal.ni.normalize();
        /*bodyA.quaternion.vmult(pivotA,normal.ri);
        bodyB.quaternion.vmult(pivotB,normal.rj);*/
        vec2.scale(normal.ri, normal.ni, distance*0.5);//normal.ni.mult( distance*0.5,normal.ri);
        vec2.scale(normal.rj, normal.ni, -distance*0.5);//normal.ni.mult( -distance*0.5,normal.rj);
    };
}
DistanceConstraint.prototype = new Constraint();
