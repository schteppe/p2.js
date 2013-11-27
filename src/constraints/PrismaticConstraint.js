var Constraint = require('./Constraint')
,   ContactEquation = require('./ContactEquation')
,   vec2 = require('../math/vec2')

module.exports = PrismaticConstraint;

/**
 * Constraint that only allows translation along a line between the bodies, no rotation
 *
 * @class PrismaticConstraint
 * @constructor
 * @author schteppe
 * @param {Body}    bodyA
 * @param {Body}    bodyB
 * @param {Object}  options
 * @param {Number}  options.maxForce
 * @param {Array}   options.worldAxis
 * @param {Array}   options.localAxisA
 * @param {Array}   options.localAxisB
 * @extends {Constraint}
 */
function PrismaticConstraint(bodyA,bodyB,options){
    options = options || {};
    Constraint.call(this,bodyA,bodyB);

    /*

    Should use new Equation formulation here. The constraint violation for the common axis point is

        g = ( xj + rj - xi - rj ) * n   :=  gg*n

    where r are body-local anchor points, and n is a constraint axis defined in body i frame.

        gdot =  ( vj + wj x rj - vi - wi x ri ) * n + ( xj + rj - xi - rj ) * ( wi x n )

    Note the use of the chain rule. Now we identify the jacobian

        G*W = [ -n      -ri x n + n x gg     n    rj x n ] * [vi wi vj wj]

    The rotational part is just a rotation lock.

     */


    var maxForce = this.maxForce = typeof(options.maxForce)==="undefined" ? options.maxForce : 1e6;

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new ContactEquation(bodyA,bodyB), // Tangent for bodyA
        new ContactEquation(bodyB,bodyA), // Tangent for bodyB
    ];

    var tangentA = eqs[0],
        tangentB = eqs[1];

    tangentA.minForce = tangentB.minForce = -maxForce;
    tangentA.maxForce = tangentB.maxForce =  maxForce;

    var worldAxis = vec2.create();
    if(options.worldAxis){
        vec2.copy(worldAxis, options.worldAxis);
    } else {
        vec2.sub(worldAxis, bodyB.position, bodyA.position);
    }
    vec2.normalize(worldAxis,worldAxis);

    // Axis that is local in each body
    this.localAxisA = vec2.create();
    this.localAxisB = vec2.create();
    if(options.localAxisA) vec2.copy(this.localAxisA, options.localAxisA);
    else                   vec2.rotate(this.localAxisA, worldAxis, -bodyA.angle);

    if(options.localAxisB)  vec2.copy(this.localAxisB, options.localAxisB);
    else                    vec2.rotate(this.localAxisB, worldAxis, -bodyB.angle);
}

PrismaticConstraint.prototype = new Constraint();

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 * @method update
 */
PrismaticConstraint.prototype.update = function(){
    var tangentA = this.equations[0],
        tangentB = this.equations[1],
        bodyA = this.bodyA,
        bodyB = this.bodyB;

    // Get tangent directions
    vec2.rotate(tangentA.ni, this.localAxisA, bodyA.angle - Math.PI/2);
    vec2.rotate(tangentB.ni, this.localAxisB, bodyB.angle + Math.PI/2);

    // Get distance vector
    var dist = vec2.create();
    vec2.sub(dist, bodyB.position, bodyA.position);
    vec2.scale(tangentA.ri, tangentA.ni, -vec2.dot(tangentA.ni, dist));
    vec2.scale(tangentB.ri, tangentB.ni,  vec2.dot(tangentB.ni, dist));
    vec2.add(tangentA.rj, tangentA.ri, dist);
    vec2.sub(tangentB.rj, tangentB.ri, dist);
    vec2.set(tangentA.ri, 0, 0);
    vec2.set(tangentB.ri, 0, 0);
};
