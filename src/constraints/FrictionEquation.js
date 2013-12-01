var mat2 = require('../math/mat2')
,   vec2 = require('../math/vec2')
,   Equation = require('./Equation')
,   Utils = require('../utils/Utils')

module.exports = FrictionEquation;

// 3D cross product from glmatrix, until we get this to work...
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

var dot = vec2.dot;

/**
 * Constrains the slipping in a contact along a tangent
 *
 * @class FrictionEquation
 * @constructor
 * @param {Body} bi
 * @param {Body} bj
 * @param {Number} slipForce
 * @extends {Equation}
 */
function FrictionEquation(bi,bj,slipForce){
    Equation.call(this,bi,bj,-slipForce,slipForce);

    /**
     * Relative vector from center of body i to the contact point, in world coords.
     * @property ri
     * @type {Float32Array}
     */
    this.ri = vec2.create();

    /**
     * Relative vector from center of body j to the contact point, in world coords.
     * @property rj
     * @type {Float32Array}
     */
    this.rj = vec2.create();

    /**
     * Tangent vector that the friction force will act along, in world coords.
     * @property t
     * @type {Float32Array}
     */
    this.t = vec2.create();

    /**
     * A ContactEquation connected to this friction. The contact equation can be used to rescale the max force for the friction.
     * @property contactEquation
     * @type {ContactEquation}
     */
    this.contactEquation = null;
};
FrictionEquation.prototype = new Equation();
FrictionEquation.prototype.constructor = FrictionEquation;

/**
 * Set the slipping condition for the constraint. The friction force cannot be
 * larger than this value.
 * @method setSlipForce
 * @param  {Number} slipForce
 */
FrictionEquation.prototype.setSlipForce = function(slipForce){
    this.maxForce = slipForce;
    this.minForce = -slipForce;
};

var A = Utils.ARRAY_TYPE;
var rixtVec = new A(3),
    rjxtVec = new A(3),
    ri3 = new A(3),
    rj3 = new A(3),
    t3 = new A(3);
FrictionEquation.prototype.computeB = function(a,b,h){
    var bi = this.bi,
        bj = this.bj,
        ri = this.ri,
        rj = this.rj,
        t = this.t,
        G = this.G;

    // Caluclate cross products
    ri3[0] = ri[0];
    ri3[1] = ri[1];
    rj3[0] = rj[0];
    rj3[1] = rj[1];
    t3[0] = t[0];
    t3[1] = t[1];
    cross(rixtVec, ri3, t3);//ri.cross(t,rixt);
    cross(rjxtVec, rj3, t3);//rj.cross(t,rjxt);
    var rixt = rixtVec[2];
    var rjxt = rjxtVec[2];

    // G = [-t -rixt t rjxt]
    // And remember, this is a pure velocity constraint, g is always zero!
    G[0] = -t[0];
    G[1] = -t[1];
    G[2] = -rixt;
    G[3] = t[0];
    G[4] = t[1];
    G[5] = rjxt;

    var GW = this.computeGW();
    var GiMf = this.computeGiMf();

    var B = /* - g * a  */ - GW * b - h*GiMf;

    return B;
};
