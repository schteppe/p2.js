var AABB = require('../src/collision/AABB')
,   vec2 = require('../src/math/vec2')
,   Circle = require('../src/shapes/Circle')
,   Rectangle = require('../src/shapes/Rectangle')
,   Plane = require('../src/shapes/Plane')

var aabb = new AABB(),
    offset = [2,3];

exports.aabbs = {

    Circle : function(test){
        var c = new Circle(1);
        c.computeAABB(aabb,offset,Math.PI / 2);
        test.equal(aabb.lowerBound[0],-1 + offset[0]);
        test.equal(aabb.lowerBound[1],-1 + offset[1]);
        test.equal(aabb.upperBound[0], 1 + offset[0]);
        test.equal(aabb.upperBound[1], 1 + offset[1]);
        test.done();
    },

    Rectangle : function(test){
        var c = new Rectangle(1,2);
        c.computeAABB(aabb,offset,Math.PI / 2);
        test.equal(aabb.lowerBound[0], -1   + offset[0]);
        test.equal(aabb.lowerBound[1], -0.5 + offset[1]);
        test.equal(aabb.upperBound[0],  1   + offset[0]);
        test.equal(aabb.upperBound[1],  0.5 + offset[1]);
        test.done();
    },

    Plane : function(test){
        var c = new Plane();
        c.computeAABB(aabb,offset,Math.PI / 2);
        test.equal(aabb.lowerBound[0], offset[0]);
        test.done();
    },

};
