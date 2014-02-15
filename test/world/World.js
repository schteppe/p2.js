var World = require(__dirname + '/../../src/world/World')
,   Body = require(__dirname + '/../../src/objects/Body')
,   Circle = require(__dirname + '/../../src/shapes/Circle')
,   Convex = require(__dirname + '/../../src/shapes/Convex')

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

exports.fromJSON = function(test){
    // STUB
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
    // STUB
    test.done();
};

exports.upgradeJSON = function(test){
    // STUB
    test.done();
};

