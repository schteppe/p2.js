var Line = require(__dirname + '/../../src/shapes/Line')
,   vec2 = require(__dirname + '/../../src/math/vec2')
,   AABB = require(__dirname + '/../../src/collision/AABB');

exports.construct = function(test){
    var line = new Line(2);
    test.equal(line.length, 2);
    test.deepEqual(line.points, [vec2.fromValues(-1, 0), vec2.fromValues(1, 0)]);

    line = new Line();
    test.equal(line.length, 1);
    test.deepEqual(line.points, [vec2.fromValues(-.5, 0), vec2.fromValues(.5, 0)]);

    test.done();
};

exports.fromPoints = function(test) {
    line = Line.fromPoints(10, 10, 13, 14);
    test.equal(line.length, 5);
    test.deepEqual(line.points, [vec2.fromValues(10, 10), vec2.fromValues(13, 14)]);
    test.done();
};

exports.computeAABB = function(test){
    var aabb = new AABB();
    var line = Line.fromPoints(10, 10, 13, 14);
    line.computeAABB(aabb, vec2.fromValues(100, 100), 0);

    test.deepEqual(aabb.lowerBound, vec2.fromValues(110, 110));
    test.deepEqual(aabb.upperBound, vec2.fromValues(113, 114));

    test.done();
};

