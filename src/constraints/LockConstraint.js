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
 * @param {Array}  [localOffsetB] The offset of bodyB in bodyA's frame.
 * @param {number} [localAngleB]  The angle of bodyB in bodyA's frame.
 * @param {number} maxForce
 * @extends {Constraint}
 */
function LockConstraint(bodyA,bodyB,localOffsetB,localAngleB,maxForce){
    Constraint.call(this,bodyA,bodyB);
    if(typeof(maxForce)==="undefined" )
        maxForce = Number.MAX_VALUE;

    localOffsetB = localOffsetB || vec2.fromValues(0,0);
    localAngleB = localAngleB || 0;

    // Use 3 equations:
    // gx =   (xj - xi - l) * xhat = 0
    // gy =   (xj - xi - l) * yhat = 0
    // ...and one for locking the angle.
    //
    // For the position constraints, we get
    // G*W = (vj - vi - ldot  ) * xhat
    //     = (vj - vi - wi x l) * xhat
    //
    // Since (wi x l) * xhat = (l x xhat) * wi, we get
    // G*W = [ -1   0   (-l x xhat)  1   0   0]

    var x =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        y =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        rot =   new Equation(bodyA,bodyB,-maxForce,maxForce);

    var l = vec2.create(),
        g = vec2.create();
    x.computeGq = function(){
        vec2.rotate(l,localOffsetB,bodyA.angle);
        vec2.sub(g,bodyB.position,bodyA.position);
        vec2.sub(g,g,l);
        return g[0];
    }
    y.computeGq = function(){
        vec2.rotate(l,localOffsetB,bodyA.angle);
        vec2.sub(g,bodyB.position,bodyA.position);
        vec2.sub(g,g,l);
        return g[1];
    }

    rot.G[2] =  1;
    rot.G[5] = -1;
    rot.offset = localAngleB;

    this.localOffsetB = localOffsetB;

    var eqs = this.equations = [ x, y, rot ];
}
LockConstraint.prototype = new Constraint();

var l = vec2.create();
var xAxis = vec2.fromValues(1,0);
var yAxis = vec2.fromValues(0,1);
LockConstraint.prototype.update = function(){
    var x = this.equations[0],
        y = this.equations[1];

    vec2.rotate(l,this.localOffsetB,bodyA.angle);

    x.G[0] = -1;
    x.G[1] =  0;
    x.G[2] = -vec2.crossLength(l,xAxis);
    x.G[3] =  1;

    y.G[0] =  0;
    y.G[1] = -1;
    y.G[2] = -vec2.crossLength(l,yAxis);
    y.G[4] =  1;
};
