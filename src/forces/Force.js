var vec2 = require('../math/vec2');
var Utils = require('../utils/Utils');

module.exports = Force;

/**
 * A force, applied to zero or more bodies. A Force explicitly adds force and angularForce to the bodies and does therefore not put load on the constraint solver.
 *
 * @class Force
 * @constructor
 * @param {Array} [attachments]             All attachments from this force to other bodies.
 * @param {Object} [options]
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 */
function Force(attachments, options){
    options = Utils.defaults(options,{
        damping: 1,
    });

    /**
     * Collection of all attachments
     * @property attachments
     * @type {Array}
     */
    this.attachments = attachments || [];
    if (!(this.attachments instanceof Array)) {
        this.attachments = [ attachments ];
    }

    /**
     * Damping of the force.
     * @property damping
     * @type {number}
     */
    this.damping = options.damping;
}

/**
 * Apply the force to the connected bodies.
 * @method applyForce
 */
Force.prototype.applyForce = function(){
    // To be implemented by subclasses
};
