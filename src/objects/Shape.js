    /**
     * Base class for shapes.
     * @class
     */
    exports.Shape = function(){};

    /**
     * Particle shape class.
     * @class
     * @extends p2.Shape
     */
    exports.Particle = function(){
        p2.Shape.apply(this);
    };

    /**
     * Circle shape class.
     * @class
     * @extends p2.Shape
     * @param {number} radius
     */
    exports.Circle = function(radius){
        p2.Shape.apply(this);
        /**
         * The radius of the circle.
         * @member {number}
         * @memberof p2.Circle
         */
        this.radius = radius || 1;
    };

    /**
     * Plane shape class. The plane is facing in the Y direction.
     * @class
     * @extends p2.Shape
     */
    exports.Plane = function(){
        p2.Shape.apply(this);
    };

