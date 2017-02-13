var vec2 = require('../math/vec2');
var Utils = require('../utils/Utils');
var Constraint = require('../constraints/Constraint');
var FrictionEquation = require('../equations/FrictionEquation');
var Body = require('../objects/Body');

module.exports = TopDownVehicle;

/**
 * @class TopDownVehicle
 * @constructor
 * @param {Body} chassisBody A dynamic body, already added to the world.
 * @param {Object} [options]
 *
 * @example
 *
 *     // Create a dynamic body for the chassis
 *     var chassisBody = new Body({
 *         mass: 1
 *     });
 *     var boxShape = new Box({ width: 0.5, height: 1 });
 *     chassisBody.addShape(boxShape);
 *     world.addBody(chassisBody);
 *
 *     // Create the vehicle
 *     var vehicle = new TopDownVehicle(chassisBody);
 *
 *     // Add one front wheel and one back wheel - we don't actually need four :)
 *     var frontWheel = vehicle.addWheel({
 *         localPosition: [0, 0.5] // front
 *     });
 *     frontWheel.setSideFriction(4);
 *
 *     // Back wheel
 *     var backWheel = vehicle.addWheel({
 *         localPosition: [0, -0.5] // back
 *     });
 *     backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
 *     vehicle.addToWorld(world);
 *
 *     // Steer value zero means straight forward. Positive is left and negative right.
 *     frontWheel.steerValue = Math.PI / 16;
 *
 *     // Engine force forward
 *     backWheel.engineForce = 10;
 *     backWheel.setBrakeForce(0);
 */
function TopDownVehicle(chassisBody, options){
    options = options || {};

    /**
     * @property {Body} chassisBody
     */
    this.chassisBody = chassisBody;

    /**
     * @property {Array} wheels
     */
    this.wheels = [];

    // A dummy body to constrain the chassis to
    this.groundBody = new Body({ mass: 0 });

    this.world = null;

    var that = this;
    this.preStepCallback = function(){
        that.update();
    };
}

/**
 * @method addToWorld
 * @param {World} world
 */
TopDownVehicle.prototype.addToWorld = function(world){
    this.world = world;
    world.addBody(this.groundBody);
    world.on('preStep', this.preStepCallback);
    for (var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        world.addConstraint(wheel);
    }
};

/**
 * @method removeFromWorld
 * @param {World} world
 */
TopDownVehicle.prototype.removeFromWorld = function(){
    var world = this.world;
    world.removeBody(this.groundBody);
    world.off('preStep', this.preStepCallback);
    for (var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        world.removeConstraint(wheel);
    }
    this.world = null;
};

/**
 * @method addWheel
 * @param {object} [wheelOptions]
 * @return {WheelConstraint}
 */
TopDownVehicle.prototype.addWheel = function(wheelOptions){
    var wheel = new WheelConstraint(this,wheelOptions);
    this.wheels.push(wheel);
    return wheel;
};

/**
 * @method update
 */
TopDownVehicle.prototype.update = function(){
    for (var i = 0; i < this.wheels.length; i++) {
        this.wheels[i].update();
    }
};

/**
 * @class WheelConstraint
 * @constructor
 * @extends {Constraint}
 * @param {Vehicle} vehicle
 * @param {object} [options]
 * @param {Array} [options.localForwardVector]The local wheel forward vector in local body space. Default is zero.
 * @param {Array} [options.localPosition] The local position of the wheen in the chassis body. Default is zero - the center of the body.
 * @param {Array} [options.sideFriction=5] The max friction force in the sideways direction.
 */
function WheelConstraint(vehicle, options){
    options = options || {};

    this.vehicle = vehicle;

    this.forwardEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);

    this.sideEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);

    /**
     * @property {number} steerValue
     */
    this.steerValue = 0;

    /**
     * @property {number} engineForce
     */
    this.engineForce = 0;

    this.setSideFriction(options.sideFriction !== undefined ? options.sideFriction : 5);

    /**
     * @property {Array} localForwardVector
     */
    this.localForwardVector = vec2.fromValues(0, 1);
    if(options.localForwardVector){
        vec2.copy(this.localForwardVector, options.localForwardVector);
    }

    /**
     * @property {Array} localPosition
     */
    this.localPosition = vec2.fromValues(0, 0);
    if(options.localPosition){
        vec2.copy(this.localPosition, options.localPosition);
    }

    Constraint.apply(this, vehicle.chassisBody, vehicle.groundBody);

    this.equations.push(
        this.forwardEquation,
        this.sideEquation
    );

    this.setBrakeForce(0);
}
WheelConstraint.prototype = new Constraint();

/**
 * @method setForwardFriction
 */
WheelConstraint.prototype.setBrakeForce = function(force){
    this.forwardEquation.setSlipForce(force);
};

/**
 * @method setSideFriction
 */
WheelConstraint.prototype.setSideFriction = function(force){
    this.sideEquation.setSlipForce(force);
};

var worldVelocity = vec2.create();
var relativePoint = vec2.create();

/**
 * @method getSpeed
 */
WheelConstraint.prototype.getSpeed = function(){
    this.vehicle.chassisBody.vectorToWorldFrame(relativePoint, this.localForwardVector);
    this.vehicle.chassisBody.getVelocityAtPoint(worldVelocity, relativePoint);
    return vec2.dot(worldVelocity, relativePoint);
};

var tmpVec = vec2.create();

/**
 * @method update
 */
WheelConstraint.prototype.update = function(){

    // Directional
    this.vehicle.chassisBody.vectorToWorldFrame(this.forwardEquation.t, this.localForwardVector);
    vec2.rotate(this.sideEquation.t, this.localForwardVector, Math.PI / 2);
    this.vehicle.chassisBody.vectorToWorldFrame(this.sideEquation.t, this.sideEquation.t);

    vec2.rotate(this.forwardEquation.t, this.forwardEquation.t, this.steerValue);
    vec2.rotate(this.sideEquation.t, this.sideEquation.t, this.steerValue);

    // Attachment point
    this.vehicle.chassisBody.toWorldFrame(this.forwardEquation.contactPointB, this.localPosition);
    vec2.copy(this.sideEquation.contactPointB, this.forwardEquation.contactPointB);

    this.vehicle.chassisBody.vectorToWorldFrame(this.forwardEquation.contactPointA, this.localPosition);
    vec2.copy(this.sideEquation.contactPointA, this.forwardEquation.contactPointA);

    // Add engine force
    vec2.normalize(tmpVec, this.forwardEquation.t);
    vec2.scale(tmpVec, tmpVec, this.engineForce);

    this.vehicle.chassisBody.applyForce(tmpVec, this.forwardEquation.contactPointA);
};