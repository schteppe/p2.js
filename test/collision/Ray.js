var vec2 = require("../../src/math/vec2");
var Rectangle = require('../../src/shapes/Rectangle');
var Circle = require('../../src/shapes/Circle');
var Plane = require('../../src/shapes/Plane');
var Ray = require('../../src/collision/Ray');
var Body = require('../../src/objects/Body');
var RaycastResult = require('../../src/collision/RaycastResult');
var Heightfield = require('../../src/shapes/Heightfield');

module.exports = {

    construct : function(test) {
        test.expect(0);
        var r = new Ray(vec2.create(), vec2.fromValues(1,0,0));
        test.done();
    },

    intersectBody : function(test) {
        var r = new Ray({
            from: vec2.fromValues(-5,0,0),
            to: vec2.fromValues(5, 0, 0)
        });
        r.skipBackfaces = true;
        var shape = new Plane();
        var body = new Body({ mass: 1 });
        body.addShape(shape, [0,0], Math.PI / 2);

        var result = new RaycastResult();

        r.intersectBody(body, result);
        test.ok(result.hasHit);
        test.ok(vec2.distance(result.hitPointWorld, [0, 0]) < 0.01);

        // test rotating the body first
        result.reset();
        r.intersectBody(body, result);
        test.equals(result.hasHit, true);

        // test miss
        result.reset();
        body.angle = 0;
        body.shapeAngles[0] = 0;
        var r = new Ray({
            from: vec2.fromValues(-1, 1),
            to: vec2.fromValues(1, 1)
        });
        r.intersectBody(body, result);
        test.equals(result.hasHit, false);

        test.done();
    },

    intersectBodies : function(test) {
        var r = new Ray({
            from: vec2.fromValues(-5,0),
            to: vec2.fromValues(5,0)
        });
        r.skipBackfaces = true;
        var shape = new Plane();
        var body1 = new Body({ mass: 1 });
        body1.addShape(shape, [0,0], Math.PI / 2);
        var body2 = new Body({ mass: 1 });
        body2.addShape(shape, [0,1], Math.PI / 2);

        var result = new RaycastResult();
        r.intersectBodies([body1, body2], result);
        test.equals(result.hasHit, true);
        test.done();
    }
};
