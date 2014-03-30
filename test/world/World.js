var World = require(__dirname + '/../../src/world/World')
,   Body = require(__dirname + '/../../src/objects/Body')
,   Circle = require(__dirname + '/../../src/shapes/Circle')
,   Convex = require(__dirname + '/../../src/shapes/Convex')
,   pkg = require(__dirname + '/../../package.json')
,   schema = require("./schema").schema
,   sample = require("./schema").sample
,   ZSchema = require("z-schema")

var validator = new ZSchema({
    sync: true,
    strict: true
});

exports.construct = function(test){
    // STUB
    test.done();
};

exports.addBody = function(test){
    // STUB
    test.done();
};

exports.addConstraint = function(test){
    // STUB
    test.done();
};

exports.addContactMaterial = function(test){
    // STUB
    test.done();
};

exports.addSpring = function(test){
    // STUB
    test.done();
};

exports.clear = function(test){
    // STUB
    test.done();
};

exports.clone = function(test){
    // STUB
    test.done();
};

exports.disableBodyCollision = function(test){
    var bodyA = new Body({ mass:1 }),
        bodyB = new Body({ mass:1 }),
        world = new World();
    bodyA.addShape(new Circle(1));
    bodyB.addShape(new Circle(1));
    world.addBody(bodyA);
    world.addBody(bodyB);
    world.disableBodyCollision(bodyA,bodyB);
    world.step(1/60);
    test.equal(world.narrowphase.contactEquations.length,0);
    world.enableBodyCollision(bodyA,bodyB);
    world.step(1/60);
    test.equal(world.narrowphase.contactEquations.length,1);
    test.done();
};

exports.fromJSON = function(test){
    var valid = validator.validate(sample, schema);
    if (!valid) {
        console.log(JSON.stringify(validator.getLastError().errors,2,2));
    }
    test.ok(valid, 'Sample JSON invalid!');

    // Try a JSON1 -> World -> JSON2 roundtrip and see if JSON1 == JSON2
    var world = new World();
    world.fromJSON(sample);
    var json = world.toJSON();
    test.ok(!!json);
    for(var key in sample){
        test.deepEqual(json[key],sample[key],key+" didnt survive roundtrip!");
    }
    test.done();
};

exports.getBodyById = function(test){
    // STUB
    test.done();
};

exports.getContactMaterial = function(test){
    // STUB
    test.done();
};

exports.hitTest = function(test){
    var b = new Body(),
        world = new World();
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
};

exports.integrateBody = function(test){
    // STUB
    test.done();
};

exports.removeBody = function(test){
    // STUB
    test.done();
};

exports.removeConstraint = function(test){
    // STUB
    test.done();
};

exports.removeContactMaterial = function(test){
    // STUB
    test.done();
};

exports.removeSpring = function(test){
    // STUB
    test.done();
};

exports.runNarrowphase = function(test){
    // STUB
    test.done();
};

exports.step = function(test){
    // STUB
    test.done();
};

exports.toJSON = function(test){
    var world = new World();
    var json = world.toJSON();
    var valid = validator.validate(json, schema);
    if (!valid) {
        console.log(JSON.stringify(validator.getLastError().errors,2,2));
    }
    test.ok(valid, 'Sample JSON invalid!');

    test.done();
};

exports.upgradeJSON = function(test){
    // STUB
    test.done();
};

exports.events = {
    beginContact : function(test){
        var world = new World(),
            bodyA = new Body({ mass:1 }),
            bodyB = new Body({ mass:1 });
        world.addBody(bodyA);
        world.addBody(bodyB);
        var shapeA = new Circle(1),
            shapeB = new Circle(1);
        bodyA.addShape(shapeA);
        bodyB.addShape(shapeB);
        var beginContactHits = 0,
            endContactHits = 0;
        world.on("beginContact",function(evt){
            test.ok( evt.shapeA.id == shapeA.id || evt.shapeA.id == shapeB.id );
            test.ok( evt.shapeB.id == shapeA.id || evt.shapeB.id == shapeB.id );
            test.ok( evt.bodyA.id == bodyA.id || evt.bodyA.id == bodyB.id );
            test.ok( evt.bodyB.id == bodyA.id || evt.bodyB.id == bodyB.id );
            beginContactHits++;
        });
        world.on("endContact",function(evt){
            test.ok( evt.shapeA.id == shapeA.id || evt.shapeA.id == shapeB.id );
            test.ok( evt.shapeB.id == shapeA.id || evt.shapeB.id == shapeB.id );
            test.ok( evt.bodyA.id == bodyA.id || evt.bodyA.id == bodyB.id );
            test.ok( evt.bodyB.id == bodyA.id || evt.bodyB.id == bodyB.id );
            endContactHits++;
        });
        world.step(1/60);
        bodyA.position[0] = 10;
        world.step(1/60);

        test.equal(beginContactHits,1);
        test.equal(endContactHits,1);

        test.done();
    },
};
