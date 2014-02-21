module.exports = Material;

/**
 * Defines a physics material.
 * @class Material
 * @constructor
 * @param string name
 * @author schteppe
 */
function Material(){
    /**
     * The material identifier
     * @property id
     * @type {Number}
     */
    this.id = Material.idCounter++;
};

Material.idCounter = 0;
