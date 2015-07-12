var OverlapKeeper = require(__dirname + '/../../src/utils/OverlapKeeper');
var Body = require(__dirname + '/../../src/objects/Body');
var Circle = require(__dirname + '/../../src/shapes/Circle');

exports.construct = function(test){
    var keeper = new OverlapKeeper();
    test.done();
};

exports.tick = function(test){
    var keeper = new OverlapKeeper();

    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle({ radius: 1 });
    var shapeB = new Circle({ radius: 1 });

    var keeper = new OverlapKeeper();
    keeper.recordPool.resize(0);
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    test.equal(keeper.recordPool.objects.length, 0);

    keeper.tick();

    test.equal(keeper.recordPool.objects.length, 0);

    keeper.tick();

    test.equal(keeper.recordPool.objects.length, 1);

    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    test.equal(keeper.recordPool.objects.length, 0);

    test.done();
};

exports.getEndOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var bodyC = new Body();
    var shapeA = new Circle({ radius: 1 });
    var shapeB = new Circle({ radius: 1 });
    var shapeC = new Circle({ radius: 1 });

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

    keeper.tick();

    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);
    keeper.setOverlapping(bodyC, shapeC, bodyB, shapeB);
    keeper.setOverlapping(bodyC, shapeC, bodyA, shapeA);

    var result = keeper.getEndOverlaps();
    test.equal(result.length, 0);

    keeper.tick();

    var result = keeper.getEndOverlaps();
    test.equal(result.length, 3);

    test.done();
};

exports.getNewOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var bodyC = new Body();
    var shapeA = new Circle({ radius: 1 });
    var shapeB = new Circle({ radius: 1 });
    var shapeC = new Circle({ radius: 1 });
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

    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);
    keeper.setOverlapping(bodyC, shapeC, bodyB, shapeB);
    keeper.setOverlapping(bodyC, shapeC, bodyA, shapeA);

    var result = keeper.getNewOverlaps();
    test.equal(result.length, 3);

    test.done();
};

exports.isNewOverlap = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle({ radius: 1 });
    var shapeB = new Circle({ radius: 1 });
    var keeper = new OverlapKeeper();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.isNewOverlap(shapeA, shapeB);
    test.equal(result, true);

    keeper.tick();

    var result = keeper.isNewOverlap(shapeA, shapeB);
    test.equal(result, false);

    keeper.tick();

    var result = keeper.isNewOverlap(shapeA, shapeB);
    test.equal(result, false);

    test.done();
};

exports.getNewBodyOverlaps = function(test){
    var keeper = new OverlapKeeper();
    var bodyA = new Body();
    var bodyB = new Body();
    var bodyC = new Body();
    var shapeA = new Circle();
    var shapeB = new Circle();
    var shapeC = new Circle();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.getNewBodyOverlaps();
    test.equal(result.length, 2);

    keeper.tick();

    var result = keeper.getNewBodyOverlaps();
    test.equal(result.length, 0);

    keeper.tick();

    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);
    keeper.setOverlapping(bodyC, shapeC, bodyB, shapeB);
    keeper.setOverlapping(bodyC, shapeC, bodyA, shapeA);

    var result = keeper.getNewBodyOverlaps();

    test.equal(result.length, 6);

    test.done();
};

exports.getEndBodyOverlaps = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var shapeA = new Circle({ radius: 1 });
    var shapeB = new Circle({ radius: 1 });
    var keeper = new OverlapKeeper();
    keeper.setOverlapping(bodyA, shapeA, bodyB, shapeB);

    var result = keeper.getEndBodyOverlaps();
    test.equal(result.length, 0);

    keeper.tick();

    var result = keeper.getEndBodyOverlaps();
    test.equal(result.length, 2);

    test.done();
};