var vec2 = require('../math/vec2');
var Utils = require('../utils/Utils');
var Force = require('./Force');
var Attachment = require('../objects/Attachment');

module.exports = Spring;

/**
 * A spring, connecting two bodies. The Spring explicitly adds force and angularForce to the bodies and does therefore not put load on the constraint solver.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.localAnchorB]
 * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
 * @param {Array}  [options.worldAnchorB]
 */
function Spring(bodyA, bodyB, options){
    options = Utils.defaults(options,{
        stiffness: 100,
    });

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
     * Attachment for bodyA.
     */
    var attachmentA = new Attachment(bodyA, {
        worldAnchor: options.worldAnchorA,
        localAnchor: options.localAnchorA
    });

    /**
     * Attachment for bodyA.
     */
    var attachmentB = new Attachment(bodyB, {
        worldAnchor: options.worldAnchorB,
        localAnchor: options.localAnchorB
    });

    Force.call(this, [ attachmentA, attachmentB ], options);

    /**
     * Stiffness of the spring.
     * @property stiffness
     * @type {number}
     */
    this.stiffness = options.stiffness;

    /**
     * Damping of the spring.
     * @property damping
     * @type {number}
     */
    this.damping = options.damping;
}
Spring.prototype = new Force();

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
Spring.prototype.applyForce = function(){
    // To be implemented by subclasses
};
