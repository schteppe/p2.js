var vec2 = require('../math/vec2');
var Spring = require('./Spring');
var Utils = require('../utils/Utils');
var Attachment = require('../objects/Attachment');

module.exports = LinearSpring;

/**
 * A spring, connecting two bodies.
 *
 * The Spring explicitly adds force and angularForce to the bodies.
 *
 * @class LinearSpring
 * @extends Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restLength]   A number > 0. Default is the current distance between the world anchor points.
 * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
 * @param {Array}  [options.worldAnchorB]
 * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.localAnchorB]
 */
function LinearSpring(bodyA,bodyB,options){
    options = options || {};

    Spring.call(this, bodyA, bodyB, options);

    var worldDistance = Attachment.distance(this.attachments[0], this.attachments[1]);

    /**
     * Rest length of the spring.
     * @property restLength
     * @type {number}
     */
    this.restLength = typeof(options.restLength) === "number" ? options.restLength : worldDistance;
}
LinearSpring.prototype = new Spring();

/**
 * Set the anchor point on body A, using world coordinates.
 * @method setWorldAnchorA
 * @param {Array} worldAnchorA
 */
LinearSpring.prototype.setWorldAnchorA = function(worldAnchorA){
    this.attachments[0].setWorldAnchor(worldAnchorA);
};

/**
 * Set the anchor point on body B, using world coordinates.
 * @method setWorldAnchorB
 * @param {Array} worldAnchorB
 */
LinearSpring.prototype.setWorldAnchorB = function(worldAnchorB){
    this.attachments[1].setWorldAnchor(worldAnchorB);
};

/**
 * Get the anchor point on body A, in world coordinates.
 * @method getWorldAnchorA
 * @param {Array} result The vector to store the result in.
 */
LinearSpring.prototype.getWorldAnchorA = function(result){
    this.attachments[0].getWorldAnchor(result);
};

/**
 * Get the anchor point on body B, in world coordinates.
 * @method getWorldAnchorB
 * @param {Array} result The vector to store the result in.
 */
LinearSpring.prototype.getWorldAnchorB = function(result){
    this.attachments[1].getWorldAnchor(result);
};

var applyForce_r =              vec2.create(),
    applyForce_r_unit =         vec2.create(),
    applyForce_u =              vec2.create(),
    applyForce_f =              vec2.create(),
    applyForce_worldAnchorA =   vec2.create(),
    applyForce_worldAnchorB =   vec2.create(),
    applyForce_ri =             vec2.create(),
    applyForce_rj =             vec2.create(),
    applyForce_tmp =            vec2.create();

var c = 10;

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
LinearSpring.prototype.applyForce = function(){
    var k = this.stiffness,
        d = this.damping,
        l = this.restLength,
        bodyA = this.attachments[0].body,
        bodyB = this.attachments[1].body,
        r = applyForce_r,
        r_unit = applyForce_r_unit,
        u = applyForce_u,
        f = applyForce_f,
        tmp = applyForce_tmp;

    var worldAnchorA = applyForce_worldAnchorA,
        worldAnchorB = applyForce_worldAnchorB,
        ri = applyForce_ri,
        rj = applyForce_rj;

    // Get world anchors
    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB);

    // Get offset points
    vec2.sub(ri, worldAnchorA, bodyA.position);
    vec2.sub(rj, worldAnchorB, bodyB.position);

    // Compute distance vector between world anchor points
    vec2.sub(r, worldAnchorB, worldAnchorA);
    var rlen = vec2.len(r);
    vec2.normalize(r_unit,r);

    //console.log(rlen)
    //console.log("A",vec2.str(worldAnchorA),"B",vec2.str(worldAnchorB))

    // Compute relative velocity of the anchor points, u
    vec2.sub(u, bodyB.velocity, bodyA.velocity);
    vec2.crossZV(tmp, bodyB.angularVelocity, rj);
    vec2.add(u, u, tmp);
    vec2.crossZV(tmp, bodyA.angularVelocity, ri);
    vec2.sub(u, u, tmp);

    // F = - k * ( x - L ) - D * ( u )
    vec2.scale(f, r_unit, -k*(rlen-l) - d*vec2.dot(u,r_unit));

    // Add forces to bodies
    vec2.sub( bodyA.force, bodyA.force, f);
    vec2.add( bodyB.force, bodyB.force, f);

    // Angular force
    var ri_x_f = vec2.crossLength(ri, f);
    var rj_x_f = vec2.crossLength(rj, f);
    bodyA.angularForce -= ri_x_f;
    bodyB.angularForce += rj_x_f;
};
