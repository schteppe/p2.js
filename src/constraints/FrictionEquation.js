var vec2 = require('../math/vec2')
,   Equation = require('./Equation')

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
    this.ri = vec2.create(); // Vector from center of body i to the contact point
    this.rj = vec2.create(); // Vector from center of body j to the contact point
    this.t = vec2.create();  // Tangent vector so that
    this.rixt = 0;
    this.rjxt = 0;
};
FrictionEquation.prototype = new Equation();
FrictionEquation.prototype.constructor = FrictionEquation;

/**
 * Set the slipping condition for the constraint. If the force
 * @method setSlipForce
 * @param  {Number} slipForce
 */
FrictionEquation.prototype.setSlipForce = function(slipForce){
    this.maxForce = slipForce;
    this.minForce = -slipForce;
};

var rixtVec = [0,0,0];
var rjxtVec = [0,0,0];
FrictionEquation.prototype.computeB = function(a,b,h){
    var a = this.a,
        b = this.b,
        bi = this.bi,
        bj = this.bj,
        ri = this.ri,
        rj = this.rj,
        rixt = this.rixt,
        rjxt = this.rjxt,
        t = this.t;

    // Caluclate cross products
    cross(rixtVec, [ri[0], ri[1], 0], [t[0], t[1], 0]);//ri.cross(t,rixt);
    cross(rjxtVec, [rj[0], rj[1], 0], [t[0], t[1], 0]);//rj.cross(t,rjxt);
    var rixt = this.rixt = rixtVec[2];
    var rjxt = this.rjxt = rjxtVec[2];

    var Gq = 0; // we do only want to constrain motion
    var GW = -dot(bi.velocity,t) + dot(bj.velocity,t) - rixt*bi.angularVelocity + rjxt*bj.angularVelocity; // eq. 40
    var GiMf = -dot(bi.force,t)*bi.invMass +dot(bj.force,t)*bj.invMass -rixt*bi.invInertia*bi.angularForce + rjxt*bj.invInertia*bj.angularForce;

    var B = - Gq * a - GW * b - h*GiMf;

    return B;
};

// Compute C = G * iM * G' + eps
//
// G*iM*G' =
//
//                             [ iM1          ] [-t     ]
// [-t (-ri x t) t (rj x t)] * [    iI1       ] [-ri x t]
//                             [       iM2    ] [t      ]
//                             [          iI2 ] [rj x t ]
//
// = (-t)*iM1*(-t) + (-ri x t)*iI1*(-ri x t) + t*iM2*t + (rj x t)*iI2*(rj x t)
//
// = t*iM1*t + (ri x t)*iI1*(ri x t) + t*iM2*t + (rj x t)*iI2*(rj x t)
//
FrictionEquation.prototype.computeC = function(eps){
    var bi = this.bi,
        bj = this.bj,
        rixt = this.rixt,
        rjxt = this.rjxt,
        C;

    C = bi.invMass + bj.invMass + eps;

    C += bi.invInertia * rixt * rixt;
    C += bj.invInertia * rjxt * rjxt;

    return C;
};

FrictionEquation.prototype.computeGWlambda = function(){
    var bi = this.bi;
    var bj = this.bj;
    var GWlambda = 0.0;

    GWlambda -= vec2.dot(this.t, bi.vlambda);
    GWlambda -= bi.wlambda * this.rixt;
    GWlambda += vec2.dot(this.t, bj.vlambda);
    GWlambda += bj.wlambda * this.rjxt;

    return GWlambda;
};

var FrictionEquation_addToWlambda_tmp = vec2.create();
FrictionEquation.prototype.addToWlambda = function(deltalambda){
    var bi = this.bi,
        bj = this.bj,
        rixt = this.rixt,
        rjxt = this.rjxt,
        t = this.t,
        tmp = FrictionEquation_addToWlambda_tmp;

    vec2.scale(tmp, t, -bi.invMass * deltalambda);  //t.mult(invMassi * deltalambda, tmp);
    vec2.add(bi.vlambda, bi.vlambda, tmp);          //bi.vlambda.vsub(tmp,bi.vlambda);

    vec2.scale(tmp, t, bj.invMass * deltalambda);   //t.mult(invMassj * deltalambda, tmp);
    vec2.add(bj.vlambda, bj.vlambda, tmp);          //bj.vlambda.vadd(tmp,bj.vlambda);

    bi.wlambda -= bi.invInertia * rixt * deltalambda;
    bj.wlambda += bj.invInertia * rjxt * deltalambda;
};
