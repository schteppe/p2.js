var vec2 = require('../math/vec2')
,   body = require('./Body');

module.exports = Attachment;

/**
 * Represents an single attachment to a Body. 
 *
 * @class Attachment
 * @constructor
 * @param {Body}   [body]                  Which body the attachment refers to.
 * @param {Object} [options]
 * @param {Array}  [options.localAnchor]   Where to hook the attachemnt to the body, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.worldAnchor]   Where to hook the attachment to the body, in world coordinates. Overrides the option "localAnchor" if given.
 */
function Attachment(body, options){
    options = options || {};

    /**
     * Anchor for body in local body coordinates.
     * @property localAnchor
     * @type {Array}
     */
    this.localAnchor = vec2.fromValues(0,0);

    this.body = body;

    if(options.localAnchor){ vec2.copy(this.localAnchor, options.localAnchor); }
    if(options.worldAnchor){ this.setWorldAnchor(options.worldAnchor); }
}

/**
 * Set the anchor point on body, using world coordinates.
 * @method setWorldAnchor
 * @param {Array} worldAnchor
 */
Attachment.prototype.setWorldAnchor = function(worldAnchor){
    this.body.toLocalFrame(this.localAnchor, worldAnchor);
};

/**
 * Get the anchor point on body, in world coordinates.
 * @method getWorldAnchor
 * @param {Array} result The vector to store the result in.
 */
Attachment.prototype.getWorldAnchor = function(result){
    this.body.toWorldFrame(result, this.localAnchor);
    return result;
};

Attachment.distance = function(attachmentA, attachmentB){
    var vA = attachmentA.getWorldAnchor(vec2.create());
    var vB = attachmentB.getWorldAnchor(vec2.create());
    return vec2.distance(vA, vB);
};

