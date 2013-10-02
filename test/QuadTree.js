var qtree = require('../src/collision/QuadTree')
,   QuadTree = qtree.QuadTree
,   Body = require('../src/objects/Body')
,   Circle = require('../src/shapes/Circle')
,   Plane = require('../src/shapes/Plane')
,   World = require('../src/world/World')

exports.setUp = function(callback){
    callback();
};

exports.example = function(test){
    var bounds = {
        x:0,
        y:0,
        width:100,
        height:100
    }
    var quad = new QuadTree(bounds);

    // insert random object
    var body = new Body();
    body.position[0] = 12;
    body.position[1] = 25;
    body.addShape(new Circle(10));
    quad.insert(body);

    // Test against another body
    var testBody = new Body();
    testBody.position[0] = 11;
    testBody.position[1] = 20;
    testBody.addShape(new Circle(10));
    var items = quad.retrieve(testBody);
    test.equal(items.length, 1);

    test.done();
};

exports.many = function(test){
    var options = {
        x:0,
        y:0,
        width:100,
        height:100
    };
    var quad = new QuadTree(options);

    // insert random objects
    var body;
    for(var i=0; i<100; i++){
        body = new Body();
        body.position[0] = Math.random() * options.width + options.x;
        body.position[1] = Math.random() * options.height + options.y;
        body.addShape(new Circle(Math.random()*options.width/4));
        quad.insert(body);
    }

    // Test against a body among the ones we added - we will get at least one result
    var items = quad.retrieve(body);

    test.ok(items.length >= 1);

    test.done();
};

exports.plane = function(test){
    var options = {
        x:0,
        y:0,
        width:100,
        height:100
    }
    var quad = new QuadTree(options);

    // insert random objects
    var body;
    for(var i=0; i<100; i++){
        body = new Body();
        body.position[0] = Math.random() * options.width + options.x;
        body.position[1] = Math.random() * options.height + options.y;
        body.addShape(new Circle(Math.random()*options.width/4));
        quad.insert(body);
    }

    // Insert a plane
    var planeBody = new Body();
    var planeShape = new Plane();
    planeBody.addShape(planeShape);
    quad.insert(planeBody);

    // Test against a body among the ones we added - we will get at least one result
    var testBody = new Body();
    testBody.position[0] = 0;
    testBody.position[1] = 0;
    testBody.addShape(new Circle(10));
    var items = quad.retrieve(testBody);
    test.ok(items.length >= 1);

    // Test with plane
    var items = quad.retrieve(planeBody);
    test.ok(items.length >= 1);

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
