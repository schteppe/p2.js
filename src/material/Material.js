module.exports = Material;

/**
 * Defines a physics material. To be used with {{#crossLink "ContactMaterial"}}{{/crossLink}}.
 * @class Material
 * @constructor
 * @author schteppe
 * @example
 *     // Create a wooden box
 *     var woodMaterial = new Material();
 *     var boxShape = new Box({
 *         material: woodMaterial
 *     });
 *     body.addShape(boxShape);
 */
function Material(){

    /**
     * The material identifier. Read only.
     * @readonly
     * @property id
     * @type {Number}
     */
    this.id = Material.idCounter++;
}

Material.idCounter = 0;
