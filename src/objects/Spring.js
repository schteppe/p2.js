var vec2 = require('../math/vec2');

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
 *
 * @todo Should have anchor points in the bodies
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

var applyForce_r =      vec2.create(),
    applyForce_r_unit = vec2.create(),
    applyForce_u =      vec2.create(),
    applyForce_f =      vec2.create();

/**
 * Apply the spring force to the connected bodies.
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

    vec2.sub(r, bodyA.position, bodyB.position);
    vec2.sub(u, bodyA.velocity, bodyB.velocity);
    var rlen = vec2.len(r);
    vec2.normalize(r_unit,r);
    vec2.scale(f, r_unit, k*(rlen-l) + d*vec2.dot(u,r_unit));
    vec2.sub( bodyA.force, bodyA.force, f);
    vec2.add( bodyB.force, bodyB.force, f);
};
