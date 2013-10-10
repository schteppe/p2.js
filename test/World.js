var World = require("../src/world/World")
,   Body = require("../src/objects/Body")
,   Particle = require("../src/shapes/Particle")
,   Circle = require("../src/shapes/Circle")
,   Rectangle = require("../src/shapes/Rectangle")
,   Convex = require("../src/shapes/Convex")
,   Line = require("../src/shapes/Line")
,   Capsule = require("../src/shapes/Capsule")
,   Plane = require("../src/shapes/Plane")
,   Material = require("../src/material/Material")
,   ContactMaterial = require("../src/material/ContactMaterial")
,   DistanceConstraint = require("../src/constraints/DistanceConstraint")
,   vec2 = require("../src/math/vec2")

var world;

exports.setUp = function(callback){
    world = new World();
    callback();
};

exports.toJSON = function(test){
    var size = 1,
        shapes = [
            new Particle(),
            new Circle(size/2),
            new Rectangle(size,size),
            new Convex([]),
            new Line(size),
            new Capsule(size*2,size/4),
            new Plane(),
        ];

    var r = Math.random,
        lastMaterial;
    for(var i=0; i<shapes.length; i++){
        var b = new Body({
                position : [r(),r()],
                velocity:[r(),r()],
                force : [r(),r()],
                mass : r(),
                angle : r(),
                angularVelocity : r(),
            }),
            s = shapes[i];

        b.addShape(s);

        // Add material or not?
        if(i==0){
            s.material = new Material();
            lastMaterial = s.material;
        }

        world.addBody(b);
    }

    // Create contact material
    if(lastMaterial){
        var cm = new ContactMaterial(lastMaterial,lastMaterial,{
            friction :              r(),
            restitution :           r(),
            stiffness :             r(),
            relaxation :            r(),
            frictionStiffness :     r(),
            frictionRelaxation :    r(),
        });
        world.addContactMaterial(cm);
    }

    // Add constraints
    world.addConstraint(new DistanceConstraint(world.bodies[0],world.bodies[1],r(),r()));

    // JSON roundtrip
    var world2 = new World();
    var json = world.toJSON();
    world2.fromJSON(json);

    // The only thing that should differ between the two worlds are the id's of
    // things. Therefore, we must set them to the same
    for(var i=0; i<world.bodies.length; i++){
        var b1 = world.bodies[i],
            b2 = world2.bodies[i];
        b1.id = b2.id;
        for(var j=0; j<b1.shapes.length; j++){
            var s1 = b1.shapes[j],
                s2 = b2.shapes[j];
            if(s1.material)
                s1.material.id = s2.material.id;
        }
    }

    test.deepEqual(world.constraints[0],world2.constraints[0],"World should be the same after a JSON roundtrip");

    test.done();
};

exports.hitTest = function(test){
    var b = new Body();
    world.addBody(b);
    test.deepEqual(world.hitTest([0,0],[b]) , [], "Should miss bodies without shapes");

    b.addShape(new Circle(1));
    test.deepEqual(world.hitTest([0,0],[b]) , [b], "Should hit Circle");
    test.deepEqual(world.hitTest([1.1,0],[b]) , [], "Should miss Circle");

    b = new Body();
    b.addShape(new Convex([ [-1,-1],
                            [ 1,-1],
                            [ 1, 1],
                            [-1, 1]]));
    test.deepEqual(world.hitTest([0,0],  [b]) , [b],  "Should hit Convex");
    test.deepEqual(world.hitTest([1.1,0],[b]) , [], "Should miss Convex");

    test.done();
}
