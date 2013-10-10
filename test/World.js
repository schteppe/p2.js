var World = require("../src/world/World")
,   Body = require("../src/objects/Body")
,   Circle = require("../src/shapes/Circle")
,   Convex = require("../src/shapes/Convex")
,   vec2 = require("../src/math/vec2")

var world;

exports.setUp = function(callback){
    world = new World();
    callback();
};

exports.toJSON = function(test){
    var x = vec2.fromValues(1,2),
        v = vec2.fromValues(3,4),
        f = vec2.fromValues(5,6),
        m = 5,
        a = 2,
        av = 6;
    world.addBody(new Body({
        position:x,
        velocity:v,
        mass:m,
        angle:a,
        angularVelocity:av,
        force:f,
    }));

    // JSON roundtrip
    var world2 = new World();
    var json = world.toJSON();
    world2.fromJSON(json);

    // The only thing that should differ between the two worlds are the id's of
    // things. Therefore, we must set them to the same
    for(var i=0; i<world.bodies.length; i++){
        world.bodies[i].id = world2.bodies[i].id;
    }
    test.deepEqual(world,world2,"World should be the same after a JSON roundtrip");

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
