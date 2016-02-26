var Material = require('./Material');
var Equation = require('../equations/Equation');

module.exports = ContactMaterial;

/**
 * Defines what happens when two materials meet, such as what friction coefficient to use. You can also set other things such as restitution, surface velocity and constraint parameters. Also see {{#crossLink "Material"}}{{/crossLink}}.
 * @class ContactMaterial
 * @constructor
 * @param {Material} materialA
 * @param {Material} materialB
 * @param {Object}   [options]
 * @param {Number}   [options.friction=0.3]       Friction coefficient.
 * @param {Number}   [options.frictionRelaxation] FrictionEquation relaxation.
 * @param {Number}   [options.frictionStiffness]  FrictionEquation stiffness.
 * @param {Number}   [options.relaxation]         ContactEquation relaxation.
 * @param {Number}   [options.restitution=0]      Restitution coefficient aka "bounciness".
 * @param {Number}   [options.stiffness]          ContactEquation stiffness.
 * @param {Number}   [options.surfaceVelocity=0]  Surface velocity.
 * @author schteppe
 * @example
 *     var ice = new Material();
 *     var wood = new Material();
 *     var iceWoodContactMaterial = new ContactMaterial(ice, wood, {
 *         friction: 0.2,
 *         restitution: 0.3
 *     });
 *     world.addContactMaterial(iceWoodContactMaterial);
 */
function ContactMaterial(materialA, materialB, options){
    options = options || {};

    if(!(materialA instanceof Material) || !(materialB instanceof Material)){
        throw new Error("First two arguments must be Material instances.");
    }

    /**
     * The contact material identifier. Read only.
     * @readonly
     * @property id
     * @type {Number}
     */
    this.id = ContactMaterial.idCounter++;

    /**
     * First material participating in the contact material
     * @property materialA
     * @type {Material}
     */
    this.materialA = materialA;

    /**
     * Second material participating in the contact material
     * @property materialB
     * @type {Material}
     */
    this.materialB = materialB;

    /**
     * Friction coefficient to use in the contact of these two materials. Friction = 0 will make the involved objects super slippery, and friction = 1 will make it much less slippery. A friction coefficient larger than 1 will allow for very large friction forces, which can be convenient for preventing car tires not slip on the ground.
     * @property friction
     * @type {Number}
     * @default 0.3
     */
    this.friction = options.friction !== undefined ? options.friction : 0.3;

    /**
     * Restitution, or "bounciness" to use in the contact of these two materials. A restitution of 0 will make no bounce, while restitution=1 will approximately bounce back with the same velocity the object came with.
     * @property restitution
     * @type {Number}
     * @default 0
     */
    this.restitution = options.restitution !== undefined ? options.restitution : 0;

    /**
     * Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more like a spring than a contact force. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = options.stiffness !== undefined ? options.stiffness : Equation.DEFAULT_STIFFNESS;

    /**
     * Relaxation of the resulting ContactEquation that this ContactMaterial generate. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = options.relaxation !== undefined ? options.relaxation : Equation.DEFAULT_RELAXATION;

    /**
     * Stiffness of the resulting friction force. For most cases, the value of this property should be a large number. I cannot think of any case where you would want less frictionStiffness. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
     * @property frictionStiffness
     * @type {Number}
     */
    this.frictionStiffness = options.frictionStiffness !== undefined ? options.frictionStiffness : Equation.DEFAULT_STIFFNESS;

    /**
     * Relaxation of the resulting friction force. The default value should be good for most simulations. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
     * @property frictionRelaxation
     * @type {Number}
     */
    this.frictionRelaxation = options.frictionRelaxation !== undefined ? options.frictionRelaxation  : Equation.DEFAULT_RELAXATION;

    /**
     * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
     * @property {Number} surfaceVelocity
     * @default 0
     */
    this.surfaceVelocity = options.surfaceVelocity !== undefined ? options.surfaceVelocity : 0;

    /**
     * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
     * @property contactSkinSize
     * @type {Number}
     */
    this.contactSkinSize = 0.005;
}

ContactMaterial.idCounter = 0;
