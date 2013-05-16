    /**
     * Base class for shapes.
     * @class
     */
    p2.Shape = function(){};

    /**
     * Particle shape class.
     * @class
     * @extends p2.Shape
     */
    p2.Particle = function(){
        p2.Shape.apply(this);
    };

    /**
     * Circle shape class.
     * @class
     * @extends p2.Shape
     */
    p2.Circle = function(radius){
        p2.Shape.apply(this);
        this.radius = radius || 1;
    };

    /**
     * Plane shape class.
     * @class
     * @extends p2.Shape
     */
    p2.Plane = function(){
        p2.Shape.apply(this);
    };
