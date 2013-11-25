var Constraint = require('./Constraint')
,   vec2 = require('../math/vec2')
,   Equation = require('./Equation')

module.exports = LockConstraint;

/**
 * Locks the relative position between two bodies.
 *
 * @class LockConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {number} dist The distance to keep between the bodies.
 * @param {number} maxForce
 * @extends {Constraint}
 */
function LockConstraint(bodyA,bodyB,offsetA,angleA,offsetB,angleB,maxForce){
    Constraint.call(this,bodyA,bodyB);

    if(typeof(maxForce)==="undefined" )
        maxForce = Number.MAX_VALUE;

    var x =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        y =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        rot =   new Equation(bodyA,bodyB,-maxForce,maxForce);

    // G = [-1  0  0  1  0  0;
    //       0 -1  0  0  1  0;
    //       0  0 -1  0  0  1]
    x.G[0] = -1;
    x.G[3] =  1;
    y.G[1] = -1;
    y.G[4] =  1;
    rot.G[2] =  1;
    rot.G[5] = -1;

    var eqs = this.equations = [ x,y,rot ];

    for(var i=0; i<eqs.length; i++){
        var eq = eqs[i];
        if(offsetA) vec2.copy(eq.xi, offsetA);
        if(offsetB) vec2.copy(eq.xj, offsetB);
        eq.ai = angleA || 0;
        eq.aj = angleB || 0;
    }
}
LockConstraint.prototype = new Constraint();

LockConstraint.prototype.update = function(){
    //console.log(this.equations[0].computeGW());
};
