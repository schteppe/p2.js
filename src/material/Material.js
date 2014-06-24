module.exports = Material;

/**
 * Defines a physics material.
 * @class Material
 * @constructor
 * @param {number} material identifier
 * @author schteppe
 */
function Material(id){
    /**
     * The material identifier
     * @property id
     * @type {Number}
     */
    this.id = id || Material.idCounter++;
};

Material.idCounter = 0;
