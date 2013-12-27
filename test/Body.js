var Body = require('../src/objects/Body')
,   vec2 = require('../src/math/vec2')
,   Circle = require('../src/shapes/Circle')

exports.construct = function(test){
    new Body();
    test.done();
};

exports.fromConcave = function(test){
    var b = new Body();
    test.ok(b.fromPolygon( [[-1, 1],
                            [-1, 0],
                            [1, 0],
                            [1, 1],
                            [0.5, 0.5]]));

    test.ok(b.shapes.length > 0);

    test.done();
};

exports.updateAABB = {
    withoutShapes : function(test){
        var b = new Body();
        b.updateAABB();
        test.done();
    },

    withCircle : function(test){
        var b = new Body(),
            s = new Circle(1);
        b.addShape(s);
        b.updateAABB();

        test.equal(b.aabb.lowerBound[0], -1, 'Lower AABB bound should be -1');
        test.equal(b.aabb.upperBound[0],  1, 'Upper AABB bound should be 1');
        test.equal(b.aabb.lowerBound[1], -1, 'Lower AABB bound should be -1');
        test.equal(b.aabb.upperBound[1],  1, 'Upper AABB bound should be 1');

        test.done();
    },

    withOffsetCircle : function(test){
        var b = new Body(),
            s = new Circle(1),
            offset = [-2,3];
        b.addShape(s,offset,Math.PI/2);
        b.updateAABB();

        test.equal(b.aabb.lowerBound[0], -s.radius + offset[0]);
        test.equal(b.aabb.upperBound[0],  s.radius + offset[0]);
        test.equal(b.aabb.lowerBound[1], -s.radius + offset[1]);
        test.equal(b.aabb.upperBound[1],  s.radius + offset[1]);

        test.done();
    },
};
