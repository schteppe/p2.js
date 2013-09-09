/**
 * Extensions for the vec2 object
 * @class vec2
 */
exports.vec2 = {

    /**
     * Get the vector x component
     * @method getX
     * @param  {Float32Array} a
     * @return {Number}
     */
    getX : function(a){
        return a[0];
    },

    /**
     * Get the vector y component
     * @method getY
     * @param  {Float32Array} a
     * @return {Number}
     */
    getY : function(a){
        return a[1];
    },

    /**
     * Make a cross product and only return the z component
     * @method crossLength
     * @param  {Float32Array} a
     * @param  {Float32Arrat} b
     * @return {Number}
     */
    crossLength : function(a,b){
        return a[0] * b[1] - a[1] * b[0];
    },

    /**
     * Rotate a vector by an angle
     * @method rotate
     * @param  {Float32Array} out
     * @param  {Float32Array} a
     * @param  {Number} angle
     */
    rotate : function(out,a,angle){
        var c = Math.cos(angle),
            s = Math.sin(angle);
        out[0] = c*a[0] -s*a[1];
        out[1] = s*a[0] +c*a[1];
    }
};
