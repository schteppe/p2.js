var qtree = require(__dirname + '/../../src/collision/QuadTree')
,   QuadTree = qtree.QuadTree
,   Body = require(__dirname + '/../../src/objects/Body')
,   Circle = require(__dirname + '/../../src/shapes/Circle')
,   Plane = require(__dirname + '/../../src/shapes/Plane')
,   World = require(__dirname + '/../../src/world/World')

exports.construct = function(test){
    // STUB
    test.done();
};

exports.clear = function(test){
    // STUB
    test.done();
};

exports.insert = function(test){
    // STUB
    test.done();
};

exports.getCollisionPairs = function(test){
    var options = {
        x:0,
        y:0,
        width:100,
        height:100
    }
    var quad = new QuadTree(options);
    var world = new World();
    var body = new Body();
    body.addShape(new Circle(1));
    world.addBody(body);

    var pairs = quad.getCollisionPairs(world);
    test.equal(pairs.length,0,"Should not get any results for a lonely circle");

    // Add another
    var body2 = new Body();
    body2.addShape(new Circle(1));
    world.addBody(body2);

    var pairs = quad.getCollisionPairs(world);
    test.equal(pairs.length,2,"Should get one pair as a result");

    test.done();
};

