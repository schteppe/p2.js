var AABB = require(__dirname + '/../../src/collision/AABB')
,   vec2 = require(__dirname + '/../../src/math/vec2')
,   Circle = require(__dirname + '/../../src/shapes/Circle')
,   Rectangle = require(__dirname + '/../../src/shapes/Rectangle')
,   Plane = require(__dirname + '/../../src/shapes/Plane')

exports.construct = function(test){
    // STUB
    test.done();
};

exports.computeAABB = function(test){
    var aabb = new AABB(),
        offset = [2,3];

    var c = new Circle(1);
    c.computeAABB(aabb,offset,Math.PI / 2);
    test.equal(aabb.lowerBound[0],-1 + offset[0]);
    test.equal(aabb.lowerBound[1],-1 + offset[1]);
    test.equal(aabb.upperBound[0], 1 + offset[0]);
    test.equal(aabb.upperBound[1], 1 + offset[1]);

    var c = new Rectangle(1,2);
    c.computeAABB(aabb,offset,Math.PI / 2);
    test.equal(aabb.lowerBound[0], -1   + offset[0]);
    test.equal(aabb.lowerBound[1], -0.5 + offset[1]);
    test.equal(aabb.upperBound[0],  1   + offset[0]);
    test.equal(aabb.upperBound[1],  0.5 + offset[1]);

    var c = new Plane();
    c.computeAABB(aabb,offset,Math.PI / 2);
    test.equal(aabb.lowerBound[0], offset[0]);

    test.done();
};

exports.computeMomentOfInertia = function(test){
    // STUB
    test.done();
};

exports.updateArea = function(test){
    // STUB
    test.done();
};

exports.updateBoundingRadius = function(test){
    // STUB
    test.done();
};

