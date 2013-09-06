var World = require("../../src/world/World").World
,   Body = require("../../src/objects/Body").Body
,   vec2 = require("gl-matrix").vec2

var world;

exports.setUp = function(callback){
    world = new World();
    callback();
};

exports.toJSON = function(test){
    var x = vec2.fromValues(1,2),
        v = vec2.fromValues(3,4),
        m = 5;
    world.addBody(new Body({ position:x, velocity:v, mass:m }));

    // JSON roundtrip
    var world2 = new World();
    var json = world.toJSON();
    world2.fromJSON(json);

    test.equal( world2.bodies.length , 1 );
    var b = world2.bodies[0];
    test.deepEqual( b.position, x );
    test.deepEqual( b.velocity, v );
    test.done();
};
