/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 p2.js authors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(e){if("function"==typeof bootstrap)bootstrap("p2",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeP2=e}else"undefined"!=typeof window?window.p2=e():self.p2=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// Export p2 classes
exports.Body =                  require('./objects/Body')                   .Body;
exports.Broadphase =            require('./collision/Broadphase')           .Broadphase;
exports.Circle =                require('./objects/Shape')                  .Circle;
exports.Constraint =            require('./constraints/Constraint')         .Constraint;
exports.ContactEquation =       require('./constraints/ContactEquation')    .ContactEquation;
exports.DistanceConstraint=     require('./constraints/DistanceConstraint') .DistanceConstraint;
exports.Equation =              require('./constraints/Equation')           .Equation;
exports.EventEmitter =          require('./events/EventEmitter')            .EventEmitter;
exports.GridBroadphase =        require('./collision/GridBroadphase')       .GridBroadphase;
exports.GSSolver =              require('./solver/GSSolver')                .GSSolver;
exports.NaiveBroadphase =       require('./collision/NaiveBroadphase')      .NaiveBroadphase;
exports.Plane =                 require('./objects/Shape')                  .Plane;
exports.IslandSolver =          require('./solver/IslandSolver')            .IslandSolver;
exports.Island =                require('./solver/IslandSolver')            .Island;
exports.Shape =                 require('./objects/Shape')                  .Shape;
exports.Solver =                require('./solver/Solver')                  .Solver;
exports.Spring =                require('./objects/Body')                   .Spring;
exports.World =                 require('./world/World')                    .World;

// Export the gl-matrix stuff we already use internally. Why shouldn't we? It's already in the bundle.
exports.vec2 = require('./math/vec2');
exports.mat2 = require('./math/mat2');

},{"./objects/Body":2,"./objects/Shape":3,"./collision/Broadphase":4,"./constraints/Constraint":5,"./constraints/ContactEquation":6,"./constraints/DistanceConstraint":7,"./constraints/Equation":8,"./events/EventEmitter":9,"./collision/GridBroadphase":10,"./solver/GSSolver":11,"./collision/NaiveBroadphase":12,"./solver/IslandSolver":13,"./solver/Solver":14,"./world/World":15,"./math/vec2":16,"./math/mat2":17}],3:[function(require,module,exports){
/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 */
exports.Shape = Shape;
function Shape(){

};

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends Shape
 */
exports.Particle = function(){
    Shape.apply(this);
};

/**
 * Circle shape class.
 * @class Circle
 * @extends Shape
 * @constructor
 * @param {number} radius
 */
exports.Circle = function(radius){
    Shape.apply(this);

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = radius || 1;
};

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 */
exports.Plane = function(){
    Shape.apply(this);
};

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends Shape
 * @param {Array} vertices An array of Float32Array vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 */
exports.Convex = Convex;
function Convex(vertices){
    Shape.apply(this);

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = vertices;
};

},{}],5:[function(require,module,exports){
exports.Constraint = Constraint;

/**
 * Base constraint class.
 *
 * @class Constraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function Constraint(bodyA,bodyB){

    /**
     * Equations to be solved in this constraint
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * First body participating in the constraint.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
};

/**
 * To be implemented by subclasses. Should update the internal constraint parameters.
 * @method update
 */
Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};

},{}],8:[function(require,module,exports){
exports.Equation = Equation;

/**
 * Base class for constraint equations.
 * @class Equation
 * @constructor
 * @param {Body} bi First body participating in the equation
 * @param {Body} bj Second body participating in the equation
 * @param {number} minForce Minimum force to apply. Default: -1e6
 * @param {number} maxForce Maximum force to apply. Default: 1e6
 */
function Equation(bi,bj,minForce,maxForce){
    this.id = -1;
    this.minForce = typeof(minForce)=="undefined" ? -1e6 : minForce;
    this.maxForce = typeof(maxForce)=="undefined" ? 1e6 : maxForce;
    this.bi = bi;
    this.bj = bj;
};
Equation.prototype.constructor = Equation;


},{}],9:[function(require,module,exports){
var EventEmitter = function () {}

exports.EventEmitter = EventEmitter;

EventEmitter.prototype = {
    constructor: EventEmitter,
    on: function ( type, listener ) {
        if ( this._listeners === undefined ) this._listeners = {};
        var listeners = this._listeners;
        if ( listeners[ type ] === undefined ) {
            listeners[ type ] = [];
        }
        if ( listeners[ type ].indexOf( listener ) === - 1 ) {
            listeners[ type ].push( listener );
        }
        return this;
    },
    has: function ( type, listener ) {
        if ( this._listeners === undefined ) return false;
        var listeners = this._listeners;
        if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
            return true;
        }
        return false;
    },
    off: function ( type, listener ) {
        if ( this._listeners === undefined ) return;
        var listeners = this._listeners;
        var index = listeners[ type ].indexOf( listener );
        if ( index !== - 1 ) {
            listeners[ type ].splice( index, 1 );
        }
    },
    emit: function ( event ) {
        if ( this._listeners === undefined ) return;
        var listeners = this._listeners;
        var listenerArray = listeners[ event.type ];
        if ( listenerArray !== undefined ) {
            event.target = this;
            for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {
                listenerArray[ i ].call( this, event );
            }
        }
        return this;
    }
};

},{}],14:[function(require,module,exports){
exports.Solver = Solver;

/**
 * Base class for constraint solvers.
 * @class Solver
 * @constructor
 */
function Solver(){

    /**
     * Current equations in the solver.
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];
};

Solver.prototype.solve = function(dt,world){
    throw new Error("Solver.solve should be implemented by subclasses!");
};

/**
 * Add an equation to be solved.
 *
 * @method addEquation
 * @param {Equation} eq
 */
Solver.prototype.addEquation = function(eq){
    this.equations.push(eq);
};

/**
 * Remove an equation.
 *
 * @method removeEquation
 * @param {Equation} eq
 */
Solver.prototype.removeEquation = function(eq){
    var i = this.equations.indexOf(eq);
    if(i!=-1)
        this.equations.splice(i,1);
};

/**
 * Remove all currently added equations.
 *
 * @method removeAllEquations
 */
Solver.prototype.removeAllEquations = function(){
    this.equations = [];
};


},{}],2:[function(require,module,exports){
var vec2 = require('../math/vec2');

exports.Body = Body;
exports.Spring = Spring;

/**
 * A spring, connecting two bodies.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} options.restLength A number > 0. Default: 1
 * @param {number} options.stiffness A number >= 0. Default: 100
 * @param {number} options.damping A number >= 0. Default: 1
 */
function Spring(bodyA,bodyB,options){
    options = options || {};

    /**
     * Rest length of the spring.
     * @property restLength
     * @type {number}
     */
    this.restLength = options.restLength || 1;

    /**
     * Stiffness of the spring.
     * @property stiffness
     * @type {number}
     */
    this.stiffness = options.stiffness || 100;

    /**
     * Damping of the spring.
     * @property damping
     * @type {number}
     */
    this.damping = options.damping || 1;

    /**
     * First connected body.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second connected body.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
};

/**
 * A physics body.
 *
 * @class Body
 * @constructor
 * @param {Object} [options]
 * @param {Shape}   options.shape           Used for collision detection. If absent the body will not collide.
 * @param {number}  options.mass            A number >= 0. If zero, the body becomes static. Defaults to static [0].
 * @param {Float32Array}    options.position
 * @param {Float32Array}    options.velocity
 * @param {number}  options.angle
 * @param {number}  options.angularVelocity
 * @param {Float32Array}    options.force
 * @param {number}  options.angularForce
 */
function Body(options){
    options = options || {};

    /**
     * The body identifyer
     * @property id
     * @type {Number}
     */
    this.id = ++Body._idCounter;

    /**
     * The shape belonging to the body.
     * @property shape
     * @type {Shape}
     */
    this.shape = options.shape;

    /**
     * The mass of the body.
     * @property mass
     * @type {number}
     */
    this.mass = options.mass || 0;
    this.invMass = this.mass > 0 ? 1 / this.mass : 0;
    this.inertia = options.inertia || this.mass; // todo
    this.invInertia = this.invMass; // todo

    /**
     * The position of the body
     * @property position
     * @type {Float32Array}
     */
    this.position = vec2.create();
    if(options.position) vec2.copy(this.position, options.position);

    /**
     * The velocity of the body
     * @property velocity
     * @type {Float32Array}
     */
    this.velocity = vec2.create();
    if(options.velocity) vec2.copy(this.velocity, options.velocity);

    this.vlambda = vec2.create();
    this.wlambda = 0;

    /**
     * The angle of the body
     * @property angle
     * @type {number}
     */
    this.angle = options.angle || 0;

    /**
     * The angular velocity of the body
     * @property angularVelocity
     * @type {number}
     */
    this.angularVelocity = options.angularVelocity || 0;

    /**
     * The force acting on the body
     * @property force
     * @type {Float32Array}
     */
    this.force = vec2.create();
    if(options.force) vec2.copy(this.force, options.force);

    /**
     * The angular force acting on the body
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The type of motion this body has. Should be one of: Body.STATIC, Body.DYNAMIC and Body.KINEMATIC.
     * @property motionState
     * @type {number}
     */
    this.motionState = this.mass == 0 ? Body.STATIC : Body.DYNAMIC;
};

Body._idCounter = 0;


/**
 * Apply force to a world point. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce.
 * @method applyForce
 * @param {Float32Array} force The force to add.
 * @param {Float32Array} worldPoint A world point to apply the force on.
 */
var Body_applyForce_r = vec2.create();
Body.prototype.applyForce = function(force,worldPoint){
    // Compute point position relative to the body center
    var r = Body_applyForce_r;
    vec2.sub(r,worldPoint,this.position);

    // Add linear force
    vec2.add(this.force,this.force,force);

    // Compute produced rotational force
    var rotForce = vec2.crossLength(r,force);

    // Add rotational force
    this.angularForce += rotForce;
};

/**
 * Dynamic body.
 * @property DYNAMIC
 * @type {Number}
 * @static
 */
Body.DYNAMIC = 1;

/**
 * Static body.
 * @property STATIC
 * @type {Number}
 * @static
 */
Body.STATIC = 2;

/**
 * Kinematic body.
 * @property KINEMATIC
 * @type {Number}
 * @static
 */
Body.KINEMATIC = 4;

},{"../math/vec2":16}],6:[function(require,module,exports){
var Equation = require("./Equation").Equation,
    vec2 = require('../math/vec2');

exports.ContactEquation = ContactEquation;

/**
 * Non-penetration constraint equation.
 *
 * @class ContactEquation
 * @constructor
 * @extends Equation
 * @param {Body} bi
 * @param {Body} bj
 */
function ContactEquation(bi,bj){
    Equation.call(this,bi,bj,0,1e6);
    this.penetration = 0.0;
    this.ri = vec2.create();
    this.penetrationVec = vec2.create();
    this.rj = vec2.create();
    this.ni = vec2.create();
    this.rixn = vec2.create();
    this.rjxn = vec2.create();
    this.rixw = vec2.create();
    this.rjxw = vec2.create();
    this.relVel = vec2.create();
    this.relForce = vec2.create();
};
ContactEquation.prototype = new Equation();
ContactEquation.prototype.constructor = ContactEquation;
ContactEquation.prototype.computeB = function(a,b,h){
    var bi = this.bi,
        bj = this.bj,
        ri = this.ri,
        rj = this.rj,
        xi = bi.position,
        xj = bj.position;

    var vi = bi.velocity,
        wi = bi.angularVelocity,
        fi = bi.force,
        taui = bi.angularForce;

    var vj = bj.velocity,
        wj = bj.angularVelocity,
        fj = bj.force,
        tauj = bj.angularForce;

    var relVel = this.relVel,
        relForce = this.relForce,
        penetrationVec = this.penetrationVec,
        invMassi = bi.invMass,
        invMassj = bj.invMass,
        invIi = bi.invInertia,
        invIj = bj.invInertia,
        n = this.ni;

    // Caluclate cross products
    var rixn = this.rixn = vec2.crossLength(ri,n);
    var rjxn = this.rjxn = vec2.crossLength(rj,n);

    // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
    vec2.set(penetrationVec,0,0);
    vec2.add(penetrationVec,xj,rj);
    vec2.sub(penetrationVec,penetrationVec,xi);
    vec2.sub(penetrationVec,penetrationVec,ri);

    var Gq = vec2.dot(n,penetrationVec);

    // Compute iteration
    var GW = vec2.dot(vj,n) - vec2.dot(vi,n) + wj * rjxn - wi * rixn;
    var GiMf = vec2.dot(fj,n)*invMassj - vec2.dot(fi,n)*invMassi + invIj*tauj*rjxn - invIi*taui*rixn;

    var B = - Gq * a - GW * b - h*GiMf;

    return B;
};
// Compute C = GMG+eps in the SPOOK equation
ContactEquation.prototype.computeC = function(eps){
    var bi = this.bi;
    var bj = this.bj;
    var rixn = this.rixn;
    var rjxn = this.rjxn;
    var invMassi = bi.invMass;
    var invMassj = bj.invMass;

    var C = invMassi + invMassj + eps;

    var invIi = bi.invInertia;
    var invIj = bj.invInertia;

    // Compute rxn * I * rxn for each body
    C += invIi * rixn * rixn;
    C += invIj * rjxn * rjxn;

    return C;
};
var computeGWlambda_ulambda = vec2.create();
ContactEquation.prototype.computeGWlambda = function(){
    var bi = this.bi;
    var bj = this.bj;
    var ulambda = computeGWlambda_ulambda;

    var GWlambda = 0.0;
    vec2.sub( ulambda,bj.vlambda, bi.vlambda);
    GWlambda += vec2.dot(ulambda,this.ni);

    // Angular
    GWlambda -= bi.wlambda * this.rixn;
    GWlambda += bj.wlambda * this.rjxn;

    return GWlambda;
};

var addToWlambda_temp = vec2.create();
ContactEquation.prototype.addToWlambda = function(deltalambda){
    var bi = this.bi;
    var bj = this.bj;
    var rixn = this.rixn;
    var rjxn = this.rjxn;
    var invMassi = bi.invMass;
    var invMassj = bj.invMass;
    var n = this.ni;
    var temp = addToWlambda_temp;

    // Add to linear velocity
    vec2.scale(temp,n,invMassi*deltalambda);
    vec2.sub( bi.vlambda,bi.vlambda, temp );

    vec2.scale(temp,n,invMassj*deltalambda);
    vec2.add( bj.vlambda,bj.vlambda, temp);

    // Add to angular velocity
    bi.wlambda -= bi.invInertia * rixn * deltalambda;
    bj.wlambda += bj.invInertia * rjxn * deltalambda;
};


},{"./Equation":8,"../math/vec2":16}],7:[function(require,module,exports){
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
    // Should be appended to the .prototype
    this.update = function(){
        vec2.subtract(normal.ni, bodyB.position, bodyA.position);
        vec2.normalize(normal.ni,normal.ni);
        vec2.scale(normal.ri, normal.ni, distance*0.5);
        vec2.scale(normal.rj, normal.ni, -distance*0.5);
    };
}
DistanceConstraint.prototype = new Object(Constraint.prototype);

},{"./Constraint":5,"./ContactEquation":6,"../math/vec2":16}],4:[function(require,module,exports){
var vec2 = require('../math/vec2')
,   mat2 = require('../math/mat2')

var dist = vec2.create();
var rot = mat2.create();
var worldNormal = vec2.create();
var yAxis = vec2.fromValues(0,1);
exports.checkCircleCircle = function(c1,c2,result){
    vec2.sub(dist,c1.position,c2.position);
    var R1 = c1.shape.radius;
    var R2 = c2.shape.radius;
    if(vec2.sqrLen(dist) < (R1+R2)*(R1+R2)){
        result.push(c1);
        result.push(c2);
    }
};

exports.checkCirclePlane = function(c,p,result){
    vec2.sub(dist,c.position,p.position);
    vec2.rotate(worldNormal,yAxis,p.angle);
    if(vec2.dot(dist,worldNormal) <= c.shape.radius){
        result.push(c);
        result.push(p);
    }
}

exports.checkCircleParticle = function(c,p,result){
    result.push(c);
    result.push(p);
};

// Generate contacts / do nearphase
exports.nearphaseCircleCircle = function(c1,c2,result,oldContacts){
    //var c = new p2.ContactEquation(c1,c2);
    var c = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(c1,c2);
    c.bi = c1;
    c.bj = c2;
    vec2.sub(c.ni,c2.position,c1.position);
    vec2.normalize(c.ni,c.ni);
    vec2.scale( c.ri,c.ni, c1.shape.radius);
    vec2.scale( c.rj,c.ni,-c2.shape.radius);
    result.push(c);
};

exports.nearphaseCircleParticle = function(c,p,result,oldContacts){
    // todo
};

var nearphaseCirclePlane_rot = mat2.create();
var nearphaseCirclePlane_planeToCircle = vec2.create();
var nearphaseCirclePlane_temp = vec2.create();
exports.nearphaseCirclePlane = function(c,p,result,oldContacts){
    var rot = nearphaseCirclePlane_rot;
    var contact = oldContacts.length ? oldContacts.pop() : new p2.ContactEquation(p,c);
    contact.bi = p;
    contact.bj = c;
    var planeToCircle = nearphaseCirclePlane_planeToCircle;
    var temp = nearphaseCirclePlane_temp;
    vec2.rotate(contact.ni,yAxis,p.angle);

    vec2.scale( contact.rj,contact.ni, -c.shape.radius);

    vec2.sub(planeToCircle,c.position,p.position);
    var d = vec2.dot(contact.ni , planeToCircle );
    vec2.scale(temp,contact.ni,d);
    vec2.sub( contact.ri ,planeToCircle , temp );

    result.push(contact);
};

var localAxis = vec2.create();
exports.projectConvexOntoAxis = projectConvexOntoAxis;
function projectConvexOntoAxis(c,axis,result){
    var max=null,
        min=null,
        v,
        value;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, c.angle);

    // Project the position of the body onto the axis - need to add this to the result
    var offset = vec2.dot(c.position, axis);

    for(var i=1; i<c.shape.vertices.length; i++){
        v = c.shape.vertices[i];
        value = vec2.dot(v,localAxis);
        if(max === null || value > max) max = value;
        if(min === null || value < min) min = value;
    }

    vec2.set( result, min + offset, max + offset);
};

var edge =      vec2.create();
var normal =    vec2.create();
var span1 =     vec2.create();
var span2 =     vec2.create();
exports.findSeparatingAxis = findSeparatingAxis;
function findSeparatingAxis(c1,c2,sepAxis){

    var maxDist = null,
        overlap = false;

    for(var j=0; j<2; j++){
        var c = j==0 ? c1 : c2;

        for(var i=1; i<c1.shape.vertices.length; i++){
            // Get the edge
            vec2.subtract(edge, c.shape.vertices[i], c.shape.vertices[i-1]);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate(normal, edge, -Math.PI / 2);
            vec2.normalize(normal,normal);

            // Project hulls onto that normal
            projectConvexOntoAxis(c1,normal,span1);
            projectConvexOntoAxis(c2,normal,span2);

            var a=span1,
                b=span2;
            if(span1[0] > span2[0]){
                b=span1;
                a=span2;
            }

            // Get separating distance
            var dist = b[1] - a[0];
            if(maxDist===null || dist > maxDist){
                vec2.copy(sepAxis, normal);
                maxDist = dist;
                overlap = dist > 0;
            }
        }
    }

    return overlap;
};

// Returns either -1 (failed) or an index of a vertex. This vertex and the next makes the closest edge.
function getClosestEdge(c,axis){

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, c.angle);

    var closestEdge = -1;
    for(var i=1; i<c.shape.vertices.length; i++){
        // Get the edge
        vec2.subtract(edge, c.shape.vertices[i], c.shape.vertices[i-1]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate(normal, edge, -Math.PI / 2);
        vec2.normalize(normal,normal);

        var dot = vec2.dot(normal,axis);
        if(closestEdge == -1 || dot > maxDot){
            closestEdge = i-1;
            maxDot = dot;
        }
    }

    return closestEdge;
};

// See http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/
exports.nearphaseConvexConvex = function(c1,c2,sepAxis){
    // Find edges with normals closest to the separating axis
    var closestEdge1 = getClosestEdge(c1,sepAxis);
    var closestEdge2 = getClosestEdge(c2,sepAxis);

    if(closestEdge1==-1 || closestEdge2==-1) return false;

    // Get the edges incident to those
    var edge1_0 = vec2.create(),
        edge1_1 = vec2.create(),
        edge1_2 = vec2.create(),
        edge2_0 = vec2.create(),
        edge2_1 = vec2.create(),
        edge2_2 = vec2.create();

    // Cases:
    // 1. No contact
    // 2. One corner on A is crossing an edge on B
    // 3. Two corners on A are crossing an edge on B
    // 4. Two corners on A are crossing an edge on B, two from B are crossing A
    // 4. Both A and B have a corner inside the other

    // Check overlaps

}

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
exports.Broadphase = function(){

};

/**
 * Get all potential intersecting body pairs.
 *
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
exports.Broadphase.prototype.getCollisionPairs = function(world){
    throw new Error("getCollisionPairs must be implemented in a subclass!");
};


},{"../math/vec2":16,"../math/mat2":17}],11:[function(require,module,exports){
var vec2 = require('../math/vec2'),
    Solver = require('./Solver').Solver;

exports.GSSolver = GSSolver;

var ARRAY_TYPE = Float32Array || Array;

/**
 * Iterative Gauss-Seidel constraint equation solver.
 *
 * @class GSSolver
 * @constructor
 * @extends Solver
 * @param {Object} [options]
 * @param {Number} options.iterations
 * @param {Number} options.timeStep
 * @param {Number} options.stiffness
 * @param {Number} options.relaxation
 * @param {Number} options.tolerance
 */
function GSSolver(options){
    Solver.call(this);
    options = options || {};
    this.iterations = options.iterations || 10;
    this.h = options.timeStep || 1.0/60.0;
    this.k = options.stiffness || 1e7;
    this.d = options.relaxation || 6;
    this.a = 0.0;
    this.b = 0.0;
    this.eps = 0.0;
    this.tolerance = options.tolerance || 0;
    this.setSpookParams(this.k, this.d);
    this.debug = options.debug || false;
    this.arrayStep = 30;
    this.lambda = new ARRAY_TYPE(this.arrayStep);
    this.Bs =     new ARRAY_TYPE(this.arrayStep);
    this.invCs =  new ARRAY_TYPE(this.arrayStep);
};
GSSolver.prototype = new Solver();

/**
 * Set stiffness parameters
 *
 * @method setSpookParams
 * @param  {number} k
 * @param  {number} d
 */
GSSolver.prototype.setSpookParams = function(k,d){
    var h=this.h;
    this.k = k;
    this.d = d;
    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = (4.0 * d) / (1 + 4 * d);
    this.eps = 4.0 / (h * h * k * (1 + 4 * d));
};

/**
 * Solve the system of equations
 * @method solve
 * @param  {Number}  dt       Time step
 * @param  {World}   world    World to solve
 */
GSSolver.prototype.solve = function(dt,world){
    var d = this.d,
        ks = this.k,
        iter = 0,
        maxIter = this.iterations,
        tolSquared = this.tolerance*this.tolerance,
        a = this.a,
        b = this.b,
        eps = this.eps,
        equations = this.equations,
        Neq = equations.length,
        bodies = world.bodies,
        Nbodies = world.bodies.length,
        h = dt;

    // Things that does not change during iteration can be computed once
    if(this.lambda.length < Neq){
        this.lambda = new ARRAY_TYPE(Neq + this.arrayStep);
        this.Bs =     new ARRAY_TYPE(Neq + this.arrayStep);
        this.invCs =  new ARRAY_TYPE(Neq + this.arrayStep);
    }
    var invCs = this.invCs;
    var Bs = this.Bs;
    var lambda = this.lambda;

    // Create array for lambdas
    for(var i=0; i!==Neq; i++){
        var c = equations[i];
        lambda[i] = 0.0;
        Bs[i] = c.computeB(a,b,h);
        invCs[i] = 1.0 / c.computeC(eps);
    }

    var q, B, c, invC, deltalambda, deltalambdaTot, GWlambda, lambdaj;

    if(Neq !== 0){
        var i,j, minForce, maxForce, lambdaj_plus_deltalambda;

        // Reset vlambda
        for(i=0; i!==Nbodies; i++){
            var b=bodies[i], vlambda=b.vlambda;
            vec2.set(vlambda,0,0);
            b.wlambda = 0;
        }

        // Iterate over equations
        for(iter=0; iter!==maxIter; iter++){

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

            for(j=0; j!==Neq; j++){

                c = equations[j];

                // Compute iteration
                maxForce = c.maxForce;
                minForce = c.minForce;
                B = Bs[j];
                invC = invCs[j];
                lambdaj = lambda[j];
                GWlambda = c.computeGWlambda(eps);
                deltalambda = invC * ( B - GWlambda - eps * lambdaj );

                // Clamp if we are not within the min/max interval
                lambdaj_plus_deltalambda = lambdaj + deltalambda;
                if(lambdaj_plus_deltalambda < minForce){
                    deltalambda = minForce - lambdaj;
                } else if(lambdaj_plus_deltalambda > maxForce){
                    deltalambda = maxForce - lambdaj;
                }
                lambda[j] += deltalambda;

                deltalambdaTot += Math.abs(deltalambda);

                c.addToWlambda(deltalambda);
            }

            // If the total error is small enough - stop iterate
            if(deltalambdaTot*deltalambdaTot <= tolSquared) break;
        }

        // Add result to velocity
        for(i=0; i!==Nbodies; i++){
            var b=bodies[i], v=b.velocity;
            vec2.add( v,v, b.vlambda);
            b.angularVelocity += b.wlambda;
        }
    }
    errorTot = deltalambdaTot;
};


},{"../math/vec2":16,"./Solver":14}],10:[function(require,module,exports){
var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    vec2 = require('../math/vec2');

/**
 * Broadphase that uses axis-aligned bins.
 * @class GridBroadphase
 * @constructor
 * @extends Broadphase
 * @param {number} xmin Lower x bound of the grid
 * @param {number} xmax Upper x bound
 * @param {number} ymin Lower y bound
 * @param {number} ymax Upper y bound
 * @param {number} nx Number of bins along x axis
 * @param {number} ny Number of bins along y axis
 */
exports.GridBroadphase = function(xmin,xmax,ymin,ymax,nx,ny){
    Broadphase.apply(this);

    nx = nx || 10;
    ny = ny || 10;
    var binsizeX = (xmax-xmin) / nx;
    var binsizeY = (ymax-ymin) / ny;

    function getBinIndex(x,y){
        var xi = Math.floor(nx * (x - xmin) / (xmax-xmin));
        var yi = Math.floor(ny * (y - ymin) / (ymax-ymin));
        return xi*ny + yi;
    }

    this.getCollisionPairs = function(world){
        var result = [];
        var collidingBodies = world.collidingBodies;
        var Ncolliding = Ncolliding=collidingBodies.length;

        var bins=[], Nbins=nx*ny;
        for(var i=0; i<Nbins; i++)
            bins.push([]);

        var xmult = nx / (xmax-xmin);
        var ymult = ny / (ymax-ymin);

        // Put all bodies into bins
        for(var i=0; i!==Ncolliding; i++){
            var bi = collidingBodies[i];
            var si = bi.shape;
            if (si === undefined) {
                continue;
            } else if(si instanceof Circle){
                // Put in bin
                // check if overlap with other bins
                var x = bi.position[0];
                var y = bi.position[1];
                var r = si.radius;

                var xi1 = Math.floor(xmult * (x-r - xmin));
                var yi1 = Math.floor(ymult * (y-r - ymin));
                var xi2 = Math.floor(xmult * (x+r - xmin));
                var yi2 = Math.floor(ymult * (y+r - ymin));

                for(var j=xi1; j<=xi2; j++){
                    for(var k=yi1; k<=yi2; k++){
                        var xi = j;
                        var yi = k;
                        if(xi*(ny-1) + yi >= 0 && xi*(ny-1) + yi < Nbins)
                            bins[ xi*(ny-1) + yi ].push(bi);
                    }
                }
            } else if(si instanceof Plane){
                // Put in all bins for now
                if(bi.angle == 0){
                    var y = bi.position[1];
                    for(var j=0; j!==Nbins && ymin+binsizeY*(j-1)<y; j++){
                        for(var k=0; k<nx; k++){
                            var xi = k;
                            var yi = Math.floor(ymult * (binsizeY*j - ymin));
                            bins[ xi*(ny-1) + yi ].push(bi);
                        }
                    }
                } else if(bi.angle == Math.PI*0.5){
                    var x = bi.position[0];
                    for(var j=0; j!==Nbins && xmin+binsizeX*(j-1)<x; j++){
                        for(var k=0; k<ny; k++){
                            var yi = k;
                            var xi = Math.floor(xmult * (binsizeX*j - xmin));
                            bins[ xi*(ny-1) + yi ].push(bi);
                        }
                    }
                } else {
                    for(var j=0; j!==Nbins; j++)
                        bins[j].push(bi);
                }
            } else {
                throw new Error("Shape not supported in GridBroadphase!");
            }
        }

        // Check each bin
        for(var i=0; i!==Nbins; i++){
            var bin = bins[i];
            for(var j=0, NbodiesInBin=bin.length; j!==NbodiesInBin; j++){
                var bi = bin[j];
                var si = bi.shape;

                for(var k=0; k!==j; k++){
                    var bj = bin[k];
                    var sj = bj.shape;

                    if(si instanceof Circle){
                             if(sj instanceof Circle)   bp.checkCircleCircle  (bi,bj,result);
                        else if(sj instanceof Particle) bp.checkCircleParticle(bi,bj,result);
                        else if(sj instanceof Plane)    bp.checkCirclePlane   (bi,bj,result);
                    } else if(si instanceof Particle){
                             if(sj instanceof Circle)   bp.checkCircleParticle(bj,bi,result);
                    } else if(si instanceof Plane){
                             if(sj instanceof Circle)   bp.checkCirclePlane   (bj,bi,result);
                    }
                }
            }
        }
        return result;
    };
};
exports.GridBroadphase.prototype = new Broadphase();


},{"../objects/Shape":3,"../math/vec2":16,"../collision/Broadphase":4}],12:[function(require,module,exports){
var Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase,
    vec2 = require('../math/vec2');

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
exports.NaiveBroadphase = function(){
    Broadphase.apply(this);
    this.getCollisionPairs = function(world){
        var collidingBodies = world.collidingBodies;
        var result = [];
        for(var i=0, Ncolliding=collidingBodies.length; i!==Ncolliding; i++){
            var bi = collidingBodies[i];
            var si = bi.shape;
            if (si === undefined) continue;
            for(var j=0; j!==i; j++){
                var bj = collidingBodies[j];
                var sj = bj.shape;
                if (sj === undefined) {
                    continue;
                } else if(si instanceof Circle){
                         if(sj instanceof Circle)   bp.checkCircleCircle  (bi,bj,result);
                    else if(sj instanceof Particle) bp.checkCircleParticle(bi,bj,result);
                    else if(sj instanceof Plane)    bp.checkCirclePlane   (bi,bj,result);
                } else if(si instanceof Particle){
                         if(sj instanceof Circle)   bp.checkCircleParticle(bj,bi,result);
                } else if(si instanceof Plane){
                         if(sj instanceof Circle)   bp.checkCirclePlane   (bj,bi,result);
                }
            }
        }
        return result;
    };
};
exports.NaiveBroadphase.prototype = new Broadphase();

},{"../objects/Shape":3,"../collision/Broadphase":4,"../math/vec2":16}],13:[function(require,module,exports){
var Solver = require('./Solver').Solver
,   ContactEquation = require('../constraints/ContactEquation').ContactEquation
,   vec2 = require('../math/vec2')
,   Body = require('../objects/Body').Body
,   STATIC = Body.STATIC

exports.IslandSolver = IslandSolver;
exports.Island = Island;

/**
 * Splits the system of bodies and equations into independent islands
 *
 * @class IslandSolver
 * @constructor
 * @param {Solver} subsolver
 * @extends Solver
 */
function IslandSolver(subsolver){
    Solver.call(this);
    var that = this;

    /**
     * The solver used in the workers.
     * @property subsolver
     * @type {Solver}
     */
    this.subsolver = subsolver;

    /**
     * Number of islands
     * @property numIslands
     * @type {number}
     */
    this.numIslands = 0;

    // Pooling of node objects saves some GC load
    this._nodePool = [];
};
IslandSolver.prototype = new Object(Solver.prototype);

function getUnvisitedNode(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && !(node.body.motionState & STATIC)){ // correct?
            return node;
        }
    }
    return false;
}

function bfs(root,visitFunc){
    var queue = [];
    queue.push(root);
    root.visited = true;
    visitFunc(root);
    while(queue.length) {
        var node = queue.pop();
        // Loop over unvisited child nodes
        var child;
        while((child = getUnvisitedNode(node.children))) {
            child.visited = true;
            visitFunc(child);
            queue.push(child);
        }
    }
}

/**
 * Solves the full system.
 * @method solve
 * @param  {Number} dt
 * @param  {World} world
 */
IslandSolver.prototype.solve = function(dt,world){
    var nodes = [],
        bodies=world.bodies,
        equations=this.equations,
        Neq=equations.length,
        Nbodies=bodies.length,
        subsolver=this.subsolver,
        workers = this._workers,
        workerData = this._workerData,
        workerIslandGroups = this._workerIslandGroups;

    // Create needed nodes, reuse if possible
    for(var i=0; i!==Nbodies; i++){
        if(this._nodePool.length)
            nodes.push( this._nodePool.pop() );
        else {
            nodes.push({
                body:bodies[i],
                children:[],
                eqs:[],
                visited:false
            });
        }
    }

    // Reset node values
    for(var i=0; i!==Nbodies; i++){
        var node = nodes[i];
        node.body = bodies[i];
        node.children.length = 0;
        node.eqs.length = 0;
        node.visited = false;
    }

    // Add connectivity data. Each equation connects 2 bodies.
    for(var k=0; k!==Neq; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bi),
            j=bodies.indexOf(eq.bj),
            ni=nodes[i],
            nj=nodes[j];
        ni.children.push(nj);
        ni.eqs.push(eq);
        nj.children.push(ni);
        nj.eqs.push(eq);
    }

    // The BFS search algorithm needs a traversal function. What we do is gather all bodies and equations connected.
    var child, n=0, eqs=[], bds=[];
    function visitFunc(node){
        bds.push(node.body);
        var Neqs = node.eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = node.eqs[i];
            if(eqs.indexOf(eq) === -1){
                eqs.push(eq);
            }
        }
    }

    // Get islands
    var islands = [];
    while((child = getUnvisitedNode(nodes))){
        var island = new Island(); // @todo Should be reused from somewhere
        eqs.length = 0;
        bds.length = 0;
        bfs(child,visitFunc); // run search algo to gather an island of bodies

        // Add equations to island
        var Neqs = eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = eqs[i];
            island.equations.push(eq);
        }

        n++;
        islands.push(island);
    }

    this.numIslands = n;

    // Solve islands
    for(var i=0; i<islands.length; i++){
        islands[i].solve(dt,this.subsolver);
    }
};

/**
 * An island of bodies connected with equations.
 * @class Island
 * @constructor
 */
function Island(){

    /**
     * Current equations in this island.
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];
}

/**
 * Clean this island from bodies and equations.
 * @method reset
 */
Island.prototype.reset = function(){
    this.equations.length = this.bodies.length = 0;
}


/**
 * Get all unique bodies in this island.
 * @method getBodies
 * @return {Array} An array of Body
 */
Island.prototype.getBodies = function(){
    var bodies = [],
        bodyIds = [],
        eqs = this.equations;
    for(var i=0; i!==eqs.length; i++){
        var eq = eqs[i];
        if(bodyIds.indexOf(eq.bi.id)===-1){
            bodies.push(eq.bi);
            bodyIds.push(eq.bi.id);
        }
        if(bodyIds.indexOf(eq.bj.id)===-1){
            bodies.push(eq.bj);
            bodyIds.push(eq.bj.id);
        }
    }
    return bodies;
};

/**
 * Solves all constraints in the group of islands.
 * @method solve
 * @param  {Number} dt
 * @param  {Solver} solver
 */
Island.prototype.solve = function(dt,solver){
    var bodies = [];

    solver.removeAllEquations();

    // Add equations to solver
    var numEquations = this.equations.length;
    for(var j=0; j!==numEquations; j++){
        solver.addEquation(this.equations[j]);
    }
    var islandBodies = this.getBodies();
    var numBodies = islandBodies.length;
    for(var j=0; j!==numBodies; j++){
        bodies.push(islandBodies[j]);
    }

    // Solve
    solver.solve(dt,{bodies:bodies});
};

},{"./Solver":14,"../constraints/ContactEquation":6,"../math/vec2":16,"../objects/Body":2}],15:[function(require,module,exports){
var GSSolver = require('../solver/GSSolver').GSSolver,
    NaiveBroadphase = require('../collision/NaiveBroadphase').NaiveBroadphase,
    vec2 = require('../math/vec2'),
    Circle = require('../objects/Shape').Circle,
    Plane = require('../objects/Shape').Plane,
    Particle = require('../objects/Shape').Particle,
    EventEmitter = require('../events/EventEmitter').EventEmitter,
    Body = require('../objects/Body').Body,
    bp = require('../collision/Broadphase'),
    Broadphase = bp.Broadphase;

exports.World = World;

function now(){
    if(performance.now)
        return performance.now();
    else if(performance.webkitNow)
        return performance.webkitNow();
    else
        return new Date().getTime();
}

/**
 * The dynamics world, where all bodies and constraints lives.
 *
 * @class World
 * @constructor
 * @param {Object}          [options]
 * @param {Solver}          options.solver Defaults to GSSolver.
 * @param {Float32Array}    options.gravity Defaults to [0,-9.78]
 * @param {Broadphase}      options.broadphase Defaults to NaiveBroadphase
 * @extends {EventEmitter}
 */
function World(options){
    EventEmitter.apply(this);

    options = options || {};

    /**
     * All springs in the world.
     *
     * @property springs
     * @type {Array}
     */
    this.springs = [];

    /**
     * All bodies in the world.
     *
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];

    /**
     * The solver used to satisfy constraints and contacts.
     *
     * @property solver
     * @type {Solver}
     */
    this.solver = options.solver || new GSSolver();

    /**
     * The contacts in the world that were generated during the last step().
     *
     * @property contacts
     * @type {Array}
     */
    this.contacts = [];

    this.oldContacts = [];
    this.collidingBodies = [];

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     *
     * @property
     * @type {Float32Array}
     */
    this.gravity = options.gravity || vec2.fromValues(0, -9.78);

    /**
     * Whether to do timing measurements during the step() or not.
     *
     * @property doPofiling
     * @type {Boolean}
     */
    this.doProfiling = options.doProfiling || false;

    /**
     * How many millisecconds the last step() took. This is updated each step if .doProfiling is set to true.
     *
     * @property lastStepTime
     * @type {Number}
     */
    this.lastStepTime = 0.0;

    /**
     * The broadphase algorithm to use.
     *
     * @property broadphase
     * @type {Broadphase}
     */
    this.broadphase = options.broadphase || new NaiveBroadphase();

    /**
     * User-added constraints.
     *
     * @property constraints
     * @type {Array}
     */
    this.constraints = [];

    // Id counters
    this._constraintIdCounter = 0;
    this._bodyIdCounter = 0;

    // Event objects that are reused
    this.postStepEvent = {
        type : "postStep",
    };
    this.addBodyEvent = {
        type : "addBody",
        body : null
    };
    this.addSpringEvent = {
        type : "addSpring",
        body : null
    };
};
World.prototype = new Object(EventEmitter.prototype);

/**
 * Add a constraint to the simulation.
 *
 * @method addConstraint
 * @param {Constraint} c
 */
World.prototype.addConstraint = function(c){
    this.constraints.push(c);
    c.id = this._constraintIdCounter++;
};

/**
 * Removes a constraint
 *
 * @method removeConstraint
 * @param {Constraint} c
 */
World.prototype.removeConstraint = function(c){
    var idx = this.constraints.indexOf(c);
    if(idx!==-1){
        this.constraints.splice(idx,1);
    }
};

var step_r = vec2.create();
var step_runit = vec2.create();
var step_u = vec2.create();
var step_f = vec2.create();
var step_fhMinv = vec2.create();
var step_velodt = vec2.create();

/**
 * Step the physics world forward in time.
 *
 * @method step
 * @param {Number} dt The time step size to use.
 * @param {Function} callback Called when done.
 */
World.prototype.step = function(dt){
    var that = this,
        doProfiling = this.doProfiling,
        Nsprings = this.springs.length,
        springs = this.springs,
        bodies = this.bodies,
        collidingBodies=this.collidingBodies,
        g = this.gravity,
        solver = this.solver,
        Nbodies = this.bodies.length,
        broadphase = this.broadphase,
        constraints = this.constraints,
        t0, t1;

    if(doProfiling){
        t0 = now();
    }

    // add gravity to bodies
    for(var i=0; i!==Nbodies; i++){
        var fi = bodies[i].force;
        vec2.add(fi,fi,g);
    }

    // Calculate all new spring forces
    for(var i=0; i!==Nsprings; i++){
        var s = springs[i];
        var k = s.stiffness;
        var d = s.damping;
        var l = s.restLength;
        var bodyA = s.bodyA;
        var bodyB = s.bodyB;
        var r = step_r;
        var r_unit = step_runit;
        var u = step_u;
        var f = step_f;

        vec2.sub(r,bodyA.position,bodyB.position);
        vec2.sub(u,bodyA.velocity,bodyB.velocity);
        var rlen = vec2.len(r);
        vec2.normalize(r_unit,r);
        vec2.scale(f, r_unit, k*(rlen-l) + d*vec2.dot(u,r_unit));
        vec2.sub( bodyA.force,bodyA.force, f);
        vec2.add( bodyB.force,bodyB.force, f);
    }

    // Broadphase
    var result = broadphase.getCollisionPairs(this);

    // Nearphase
    var oldContacts = this.contacts.concat(this.oldContacts);
    var contacts = this.contacts = [];
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i];
        var bj = result[i+1];
        var si = bi.shape;
        var sj = bj.shape;
        if(si instanceof Circle){
                 if(sj instanceof Circle)   bp.nearphaseCircleCircle  (bi,bj,contacts,oldContacts);
            else if(sj instanceof Particle) bp.nearphaseCircleParticle(bi,bj,contacts,oldContacts);
            else if(sj instanceof Plane)    bp.nearphaseCirclePlane   (bi,bj,contacts,oldContacts);
        } else if(si instanceof Particle){
                 if(sj instanceof Circle)   bp.nearphaseCircleParticle(bj,bi,contacts,oldContacts);
        } else if(si instanceof Plane){
                 if(sj instanceof Circle)   bp.nearphaseCirclePlane   (bj,bi,contacts,oldContacts);
        }
    }
    this.oldContacts = oldContacts;

    // Add equations to solver
    for(var i=0, Ncontacts=contacts.length; i!==Ncontacts; i++){
        solver.addEquation(contacts[i]);
    }
    // Add user-defined constraint equations
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        var c = constraints[i];
        c.update();
        for(var j=0, Neq=c.equations.length; j!==Neq; j++){
            var eq = c.equations[j];
            solver.addEquation(eq);
        }
    }
    solver.solve(dt,this);

    solver.removeAllEquations();

    // Step forward
    var fhMinv = step_fhMinv;
    var velodt = step_velodt;
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];
        if(body.mass>0){
            var minv = 1.0 / body.mass,
                f = body.force,
                pos = body.position,
                velo = body.velocity;

            // Angular step
            body.angularVelocity += body.angularForce * body.invInertia * dt;
            body.angle += body.angularVelocity * dt;

            // Linear step
            vec2.scale(fhMinv,f,dt*minv);
            vec2.add(velo,fhMinv,velo);
            vec2.scale(velodt,velo,dt);
            vec2.add(pos,pos,velodt);
        }
    }

    // Reset force
    for(var i=0; i!==Nbodies; i++){
        var bi = bodies[i];
        vec2.set(bi.force,0.0,0.0);
        bi.angularForce = 0.0;
    }

    if(doProfiling){
        t1 = now();
        that.lastStepTime = t1-t0;
    }

    this.emit(this.postStepEvent);
};

/**
 * Add a spring to the simulation
 *
 * @method addSpring
 * @param {Spring} s
 */
World.prototype.addSpring = function(s){
    this.springs.push(s);
    this.addSpringEvent.spring = s;
    this.emit(this.addSpringEvent);
};

/**
 * Remove a spring
 *
 * @method removeSpring
 * @param {Spring} s
 */
World.prototype.removeSpring = function(s){
    var idx = this.springs.indexOf(s);
    if(idx===-1)
        this.springs.splice(idx,1);
};

/**
 * Add a body to the simulation
 *
 * @method addBody
 * @param {Body} body
 */
World.prototype.addBody = function(body){
    this.bodies.push(body);
    this.collidingBodies.push(body);
    this.addBodyEvent.body = body;
    this.emit(this.addBodyEvent);
};

/**
 * Remove a body from the simulation
 *
 * @method removeBody
 * @param {Body} body
 */
World.prototype.removeBody = function(body){
    var idx = this.bodies.indexOf(body);
    if(idx===-1)
        this.bodies.splice(idx,1);
};

/**
 * Convert the world to a JSON-serializable Object.
 *
 * @method toJSON
 * @return {Object}
 */
World.prototype.toJSON = function(){
    var json = {
        p2 : "0.1.0",
        bodies : [],
        springs : [],
        solver : {},
        gravity : v2a(this.gravity),
        broadphase : {},
        constraints : [],
    };
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        json.bodies.push({
            mass : b.mass,
            angle : b.angle,
            position : v2a(b.position),
            velocity : v2a(b.velocity),
            angularVelocity : b.angularVelocity,
            force : v2a(b.force),
        });
    }
    return json;

    function v2a(v){
        return [v[0],v[1]];
    }
};

/**
 * Load a scene from a serialized state.
 *
 * @method fromJSON
 * @param  {Object} json
 * @return {Boolean} True on success, else false.
 */
World.prototype.fromJSON = function(json){
    this.clear();

    if(!json.p2)
        return false;

    switch(json.p2){

    case "0.1.0":
        for(var i=0; i<json.bodies.length; i++){
            var jb = json.bodies[i];
            var b = new Body({
                mass :              jb.mass,
                position :          jb.position,
                angle :             jb.angle,
                velocity :          jb.velocity,
                angularVelocity :   jb.angularVelocity,
                force :             jb.force,
            });
            this.addBody(b);
        }
        break;

    default:
        return false;
        break;
    }

    return true;
};

/**
 * Resets the World, removes all bodies and constraints.
 *
 * @method clear
 */
World.prototype.clear = function(){

    // Remove all constraints
    var cs = this.constraints;
    for(var i=0; i<cs.length; i++)
        this.removeConstraint(cs[i]);

    // Remove all bodies
    var bodies = this.bodies;
    for(var i=0; i<bodies.length; i++)
        this.removeBody(bodies[i]);

    // Remove all springs
    var springs = this.springs;
    for(var i=0; i<springs.length; i++)
        this.removeSpring(springs[i]);

};

},{"../solver/GSSolver":11,"../collision/NaiveBroadphase":12,"../math/vec2":16,"../objects/Shape":3,"../events/EventEmitter":9,"../objects/Body":2,"../collision/Broadphase":4}],16:[function(require,module,exports){
// Only import vec2 from gl-matrix and skip the rest
var vec2 = require('../../node_modules/gl-matrix/src/gl-matrix/vec2').vec2;

// Now add some extensions

/**
 * Get the vector x component
 * @method getX
 * @param  {Float32Array} a
 * @return {Number}
 */
vec2.getX = function(a){
    return a[0];
};

/**
 * Get the vector y component
 * @method getY
 * @param  {Float32Array} a
 * @return {Number}
 */
vec2.getY = function(a){
    return a[1];
};

/**
 * Make a cross product and only return the z component
 * @method crossLength
 * @param  {Float32Array} a
 * @param  {Float32Arrat} b
 * @return {Number}
 */
vec2.crossLength = function(a,b){
    return a[0] * b[1] - a[1] * b[0];
};

/**
 * Rotate a vector by an angle
 * @method rotate
 * @param  {Float32Array} out
 * @param  {Float32Array} a
 * @param  {Number} angle
 */
vec2.rotate = function(out,a,angle){
    var c = Math.cos(angle),
        s = Math.sin(angle);
    out[0] = c*a[0] -s*a[1];
    out[1] = s*a[0] +c*a[1];
};

// Export everything
module.exports = vec2;

},{"../../node_modules/gl-matrix/src/gl-matrix/vec2":18}],17:[function(require,module,exports){
// Only import mat2 from gl-matrix and skip the rest
var mat2 = require('../../node_modules/gl-matrix/src/gl-matrix/mat2').mat2;

// Export everything
module.exports = mat2;

},{"../../node_modules/gl-matrix/src/gl-matrix/mat2":19}],18:[function(require,module,exports){
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2 = {};

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}
 
/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    return new Float32Array(2);
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new Float32Array(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new Float32Array(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {vec2} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Caclulates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Caclulates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Caclulates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = x * m[0] + y * m[1];
    out[1] = x * m[2] + y * m[3];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = new Float32Array(2);

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}

},{}],19:[function(require,module,exports){
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */
var mat2 = {};

var mat2Identity = new Float32Array([
    1, 0,
    0, 1
]);

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    return new Float32Array(mat2Identity);
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new Float32Array(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Caclulates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {mat2} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {mat2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}

},{}]},{},[1])(1)
});
;