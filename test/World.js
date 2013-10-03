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

    test.equal( world2.bodies.length , 1 );
    var b = world2.bodies[0];
    test.deepEqual( b.position, x );
    test.deepEqual( b.velocity, v );
    test.deepEqual( b.force, f );
    test.deepEqual( b.mass, m );
    test.deepEqual( b.angle, a );
    test.deepEqual( b.angularVelocity, av );
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
