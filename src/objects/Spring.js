var vec2 = require('../math/vec2');

module.exports = Spring;

/**
 * A spring, connecting two bodies.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} options.restLength   A number > 0. Default: 1
 * @param {number} options.stiffness    A number >= 0. Default: 100
 * @param {number} options.damping      A number >= 0. Default: 1
 * @param {Array}  options.worldAnchorA Where to hook the spring to body A, in world coordinates.
 * @param {Array}  options.worldAnchorB
 * @param {Array}  options.localAnchorA Where to hook the spring to body A, in local body coordinates.
 * @param {Array}  options.localAnchorB
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

    /**
     * Anchor for bodyA in local bodyA coordinates.
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = vec2.fromValues(0,0);

    /**
     * Anchor for bodyB in local bodyB coordinates.
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = vec2.fromValues(0,0);

    if(options.localAnchorA) vec2.copy(this.localAnchorA, options.localAnchorA);
    if(options.localAnchorB) vec2.copy(this.localAnchorB, options.localAnchorB);
    if(options.worldAnchorA) this.setWorldAnchorA(options.worldAnchorA);
    if(options.worldAnchorB) this.setWorldAnchorB(options.worldAnchorB);
};

Spring.prototype.setWorldAnchorA = function(worldAnchorA){
    Spring._setWorldAnchorBase(this.localAnchorA, worldAnchorA, this.bodyA);
};

Spring.prototype.setWorldAnchorB = function(worldAnchorB){
    Spring._setWorldAnchorBase(this.localAnchorB, worldAnchorB, this.bodyB);
};

Spring.prototype.getWorldAnchorA = function(result){
    Spring._getWorldAnchorBase(this.localAnchorA, this.bodyA, result);
};

Spring.prototype.getWorldAnchorB = function(result){
    Spring._getWorldAnchorBase(this.localAnchorB, this.bodyB, result);
};

Spring._setWorldAnchorBase = function(targetLocalAnchor, worldAnchor, body){
    vec2.copy(targetLocalAnchor, worldAnchor);
    vec2.sub(targetLocalAnchor, targetLocalAnchor, body.position);
    vec2.rotate(targetLocalAnchor, targetLocalAnchor, -body.angle);
};

Spring._getWorldAnchorBase = function(localAnchor, body, result){
    vec2.copy(result, localAnchor);
    vec2.rotate(result, result, body.angle);
    vec2.add(result, result, body.position);
};

var applyForce_r =              vec2.create(),
    applyForce_r_unit =         vec2.create(),
    applyForce_u =              vec2.create(),
    applyForce_f =              vec2.create(),
    applyForce_worldAnchorA =   vec2.create(),
    applyForce_worldAnchorB =   vec2.create();

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
Spring.prototype.applyForce = function(){
    var k = this.stiffness,
        d = this.damping,
        l = this.restLength,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        r = applyForce_r,
        r_unit = applyForce_r_unit,
        u = applyForce_u,
        f = applyForce_f;

/*
    var worldAnchorA = applyForce_worldAnchorA,
        worldAnchorB = applyForce_worldAnchorB;

    this.getWorldAnchorA();
    */

    // Compute distance vector between world anchor points
    vec2.sub(r, bodyA.position, bodyB.position);
    var rlen = vec2.len(r);
    vec2.normalize(r_unit,r);

    // Compute relative velocity
    vec2.sub(u, bodyA.velocity, bodyB.velocity);

    // F = - k * ( x - L ) - D * ( v )
    vec2.scale(f, r_unit, k*(rlen-l) + d*vec2.dot(u,r_unit));

    // Apply forces to bodies
    vec2.sub( bodyA.force, bodyA.force, f);
    vec2.add( bodyB.force, bodyB.force, f);
};
