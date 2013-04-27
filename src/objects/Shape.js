
    p2.Shape = function(){};

    p2.Particle = function(){
        p2.Shape.apply(this);
    };

    p2.Circle = function(radius){
        p2.Shape.apply(this);
        this.radius = radius || 1;
    };

    p2.Plane = function(){
        p2.Shape.apply(this);
    };
