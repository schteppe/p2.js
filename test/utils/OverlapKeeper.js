var OverlapKeeper = require(__dirname + '/../../src/utils/OverlapKeeper');
var Body = require(__dirname + '/../../src/objects/Body');
var Circle = require(__dirname + '/../../src/shapes/Circle');

exports.construct = function(test){
    var keeper = new OverlapKeeper();
    test.done();
};

exports.tick = function(test){
    var keeper = new OverlapKeeper();
    keeper.tick();
    test.done();
};

exports.getEndOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle(1);
    var shapeB = new Circle(1);

    var keeper = new OverlapKeeper();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.getEndOverlaps();
    test.equal(result.length, 0);

    keeper.tick();

    var result = keeper.getEndOverlaps();
    test.equal(result.length, 1);

    keeper.tick();

    var result = keeper.getEndOverlaps();
    test.equal(result.length, 0);

    test.done();
};

exports.getNewOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle(1);
    var shapeB = new Circle(1);
    var keeper = new OverlapKeeper();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.getNewOverlaps();
    test.equal(result.length, 1);
    test.equal(result[0].bodyA, bodyA);
    test.equal(result[0].bodyB, bodyB);
    test.equal(result[0].shapeA, shapeA);
    test.equal(result[0].shapeB, shapeB);

    keeper.tick();

    var result = keeper.getNewOverlaps();
    test.equal(result.length, 0);

    keeper.tick();

    var result = keeper.getNewOverlaps();
    test.equal(result.length, 0);

    test.done();
};

exports.getNewBodyOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle(1);
    var shapeB = new Circle(1);
    var keeper = new OverlapKeeper();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.getNewBodyOverlaps();
    test.equal(result.length, 2);

    keeper.tick();

    var result = keeper.getNewBodyOverlaps();
    test.equal(result.length, 0);

    test.done();
};

exports.getEndBodyOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle(1);
    var shapeB = new Circle(1);
    var keeper = new OverlapKeeper();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.getEndBodyOverlaps();
    test.equal(result.length, 0);

    keeper.tick();

    var result = keeper.getEndBodyOverlaps();
    test.equal(result.length, 2);

    test.done();
};