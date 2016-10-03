var Constraint = require('./Constraint')
,   Equation = require('../equations/Equation')
,   RotationalVelocityEquation = require('../equations/RotationalVelocityEquation')
,   RotationalLockEquation = require('../equations/RotationalLockEquation')
,   vec2 = require('../math/vec2')
,   sub = vec2.subtract
,   add = vec2.add
,   rotate = vec2.rotate
,   dot = vec2.dot
,   copy = vec2.copy
,   crossLength = vec2.crossLength;

module.exports = RevoluteConstraint;

var worldPivotA = vec2.create(),
    worldPivotB = vec2.create(),
    xAxis = vec2.fromValues(1,0),
    yAxis = vec2.fromValues(0,1),
    g = vec2.create();

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 * @class RevoluteConstraint
 * @constructor
 * @author schteppe
 * @param {Body}    bodyA
 * @param {Body}    bodyB
 * @param {Object}  [options]
 * @param {Array}   [options.worldPivot] A pivot point given in world coordinates. If specified, localPivotA and localPivotB are automatically computed from this value.
 * @param {Array}   [options.localPivotA] The point relative to the center of mass of bodyA which bodyA is constrained to.
 * @param {Array}   [options.localPivotB] See localPivotA.
 * @param {Number}  [options.maxForce] The maximum force that should be applied to constrain the bodies.
 * @extends Constraint
 *
 * @example
 *     // This will create a revolute constraint between two bodies with pivot point in between them.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     world.addBody(bodyA);
 *
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     world.addBody(bodyB);
 *
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         worldPivot: [0, 0]
 *     });
 *     world.addConstraint(constraint);
 *
 *     // Using body-local pivot points, the constraint could have been constructed like this:
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         localPivotA: [1, 0],
 *         localPivotB: [-1, 0]
 *     });
 */
function RevoluteConstraint(bodyA, bodyB, options){
    options = options || {};
    Constraint.call(this,bodyA,bodyB,Constraint.REVOLUTE,options);

    var maxForce = this.maxForce = options.maxForce !== undefined ? options.maxForce : Number.MAX_VALUE;

    /**
     * @property {Array} pivotA
     */
    var pivotA = this.pivotA = vec2.create();

    /**
     * @property {Array} pivotB
     */
    var pivotB = this.pivotB = vec2.create();

    if(options.worldPivot){
        // Compute pivotA and pivotB
        sub(pivotA, options.worldPivot, bodyA.position);
        sub(pivotB, options.worldPivot, bodyB.position);
        // Rotate to local coordinate system
        rotate(pivotA, pivotA, -bodyA.angle);
        rotate(pivotB, pivotB, -bodyB.angle);
    } else {
        // Get pivotA and pivotB
        if(options.localPivotA){
            copy(pivotA, options.localPivotA);
        }
        if(options.localPivotB){
            copy(pivotB, options.localPivotB);
        }
    }

    var motorEquation = this.motorEquation = new RotationalVelocityEquation(bodyA,bodyB);
    motorEquation.enabled = false;

    var upperLimitEquation = this.upperLimitEquation = new RotationalLockEquation(bodyA,bodyB);
    var lowerLimitEquation = this.lowerLimitEquation = new RotationalLockEquation(bodyA,bodyB);
    upperLimitEquation.minForce = lowerLimitEquation.maxForce = 0;

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new Equation(bodyA,bodyB,-maxForce,maxForce),
        new Equation(bodyA,bodyB,-maxForce,maxForce),
        motorEquation,
        upperLimitEquation,
        lowerLimitEquation
    ];

    var x = eqs[0];
    var y = eqs[1];

    x.computeGq = function(){
        rotate(worldPivotA, pivotA, bodyA.angle);
        rotate(worldPivotB, pivotB, bodyB.angle);
        add(g, bodyB.position, worldPivotB);
        sub(g, g, bodyA.position);
        sub(g, g, worldPivotA);
        return dot(g,xAxis);
    };

    y.computeGq = function(){
        rotate(worldPivotA, pivotA, bodyA.angle);
        rotate(worldPivotB, pivotB, bodyB.angle);
        add(g, bodyB.position, worldPivotB);
        sub(g, g, bodyA.position);
        sub(g, g, worldPivotA);
        return dot(g,yAxis);
    };

    y.minForce = x.minForce = -maxForce;
    y.maxForce = x.maxForce =  maxForce;

    // These never change but the angular parts do
    x.G[0] = -1;
    x.G[1] =  0;

    x.G[3] =  1;
    x.G[4] =  0;

    y.G[0] =  0;
    y.G[1] = -1;

    y.G[3] =  0;
    y.G[4] =  1;

    /**
     * The constraint position.
     * @property angle
     * @type {Number}
     * @readOnly
     */
    this.angle = 0;

    /**
     * Set to true to enable lower limit
     * @property lowerLimitEnabled
     * @type {Boolean}
     */
    this.lowerLimitEnabled = false;

    /**
     * Set to true to enable upper limit
     * @property upperLimitEnabled
     * @type {Boolean}
     */
    this.upperLimitEnabled = false;

    /**
     * The lower limit on the constraint angle.
     * @property lowerLimit
     * @type {Boolean}
     */
    this.lowerLimit = 0;

    /**
     * The upper limit on the constraint angle.
     * @property upperLimit
     * @type {Boolean}
     */
    this.upperLimit = 0;
}
RevoluteConstraint.prototype = new Constraint();
RevoluteConstraint.prototype.constructor = RevoluteConstraint;

/**
 * Set the constraint angle limits, and enable them.
 * @method setLimits
 * @param {number} lower Lower angle limit.
 * @param {number} upper Upper angle limit.
 */
RevoluteConstraint.prototype.setLimits = function (lower, upper) {
    this.lowerLimit = lower;
    this.upperLimit = upper;
    this.lowerLimitEnabled = this.upperLimitEnabled = true;
};

RevoluteConstraint.prototype.update = function(){
    var bodyA =  this.bodyA,
        bodyB =  this.bodyB,
        pivotA = this.pivotA,
        pivotB = this.pivotB,
        eqs =    this.equations,
        x = eqs[0],
        y = eqs[1],
        upperLimit = this.upperLimit,
        lowerLimit = this.lowerLimit,
        upperLimitEquation = this.upperLimitEquation,
        lowerLimitEquation = this.lowerLimitEquation;

    var relAngle = this.angle = bodyB.angle - bodyA.angle;

    upperLimitEquation.angle = upperLimit;
    upperLimitEquation.enabled = this.upperLimitEnabled && relAngle > upperLimit;

    lowerLimitEquation.angle = lowerLimit;
    lowerLimitEquation.enabled = this.lowerLimitEnabled && relAngle < lowerLimit;

    /*

    The constraint violation is

        g = xj + rj - xi - ri

    ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:

        gdot = vj + wj x rj - vi - wi x ri

    We split this into x and y directions. (let x and y be unit vectors along the respective axes)

        gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
                 = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
                 = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
                 = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
                 = G*W

    ...and similar for y. We have then identified the jacobian entries for x and y directions:

        Gx = [ x   (rj x x)   -x   -(ri x x)]
        Gy = [ y   (rj x y)   -y   -(ri x y)]

    So for example, in the X direction we would get in 2 dimensions

        G = [ [1   0   (rj x [1,0])   -1   0   -(ri x [1,0])]
              [0   1   (rj x [0,1])    0  -1   -(ri x [0,1])]
     */

    rotate(worldPivotA, pivotA, bodyA.angle);
    rotate(worldPivotB, pivotB, bodyB.angle);

    // @todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc

    var xG = x.G;
    xG[2] = -crossLength(worldPivotA,xAxis);
    xG[5] =  crossLength(worldPivotB,xAxis);

    var yG = y.G;
    yG[2] = -crossLength(worldPivotA,yAxis);
    yG[5] =  crossLength(worldPivotB,yAxis);
};

Object.defineProperties(RevoluteConstraint.prototype, {

    /**
     * @property {boolean} motorEnabled
     */
    motorEnabled: {
        get: function() {
            return this.motorEquation.enabled;
        },
        set: function(value){
            this.motorEquation.enabled = value;
        }
    },

    /**
     * @property {number} motorSpeed
     */
    motorSpeed: {
        get: function() {
            return this.motorEquation.relativeVelocity;
        },
        set: function(value){
            this.motorEquation.relativeVelocity = value;
        }
    },

    /**
     * @property {number} motorMaxForce
     */
    motorMaxForce: {
        get: function() {
            return this.motorEquation.maxForce;
        },
        set: function(value){
            var eq = this.motorEquation;
            eq.maxForce = value;
            eq.minForce = -value;
        }
    }
});

/**
 * Enable the rotational motor
 * @deprecated Use motorEnabled instead
 * @method enableMotor
 */
RevoluteConstraint.prototype.enableMotor = function(){
    console.warn("revolute.enableMotor() is deprecated, do revolute.motorEnabled = true; instead.");
    this.motorEnabled = true;
};

/**
 * Disable the rotational motor
 * @deprecated Use motorEnabled instead
 * @method disableMotor
 */
RevoluteConstraint.prototype.disableMotor = function(){
    console.warn("revolute.disableMotor() is deprecated, do revolute.motorEnabled = false; instead.");
    this.motorEnabled = false;
};

/**
 * Check if the motor is enabled.
 * @method motorIsEnabled
 * @deprecated Use motorEnabled instead
 * @return {Boolean}
 */
RevoluteConstraint.prototype.motorIsEnabled = function(){
    console.warn("revolute.motorIsEnabled() is deprecated, use revolute.motorEnabled instead.");
    return this.motorEnabled;
};

/**
 * Set the speed of the rotational constraint motor
 * @method setMotorSpeed
 * @deprecated Use .motorSpeed instead
 * @param {Number} speed
 */
RevoluteConstraint.prototype.setMotorSpeed = function(speed){
    console.warn("revolute.setMotorSpeed(speed) is deprecated, do revolute.motorSpeed = speed; instead.");
    this.motorSpeed = speed;
};

/**
 * Get the speed of the rotational constraint motor
 * @deprecated Use .motorSpeed instead
 * @method getMotorSpeed
 * @return {Number}
 */
RevoluteConstraint.prototype.getMotorSpeed = function(){
    console.warn("revolute.getMotorSpeed() is deprecated, use revolute.motorSpeed instead.");
    return this.motorSpeed;
};
