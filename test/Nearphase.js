var Nearphase = require("../src/collision/Nearphase")
,   Convex = require("../src/shapes/Convex")
,   Body = require("../src/objects/Body")
,   Rectangle = require("../src/shapes/Rectangle")
,   vec2 = require("../src/math/vec2")

var rect, circle, eps = 0.01;

exports.setUp = function(callback){

    // Rect
    rect = new Rectangle(1,1);

    // Circle
    var verts = [];
    var N = 50;
    for(var i=0; i<N; i++){
        verts.push(vec2.fromValues( Math.cos(2*Math.PI / N * i),
                                    Math.sin(2*Math.PI / N * i) ));
    }
    circle = new Convex(verts);

    callback();
};

exports.projectConvexOntoAxis = {

    circle : function(test){
        var span = vec2.create();

        // Moved along axis propendicular to the projection axis
        Nearphase.projectConvexOntoAxis(circle,[1,0],0,[0,1],span);

        test.ok(span[0] > -1 - eps);
        test.ok(span[0] < -1 + eps);
        test.ok(span[1] > 1 - eps);
        test.ok(span[1] < 1 + eps);

        // Along the x axis
        Nearphase.projectConvexOntoAxis(circle,[0,1],0,[0,1],span);

        test.ok(span[0] > 0 - eps);
        test.ok(span[0] < 0 + eps);
        test.ok(span[1] > 2 - eps);
        test.ok(span[1] < 2 + eps);

        // Along the x axis - rotated 180 degrees - should not do anything special
        Nearphase.projectConvexOntoAxis(circle,[0,1],Math.PI / 2,[0,1],span);

        test.ok(span[0] > 0 - eps);
        test.ok(span[0] < 0 + eps);
        test.ok(span[1] > 2 - eps);
        test.ok(span[1] < 2 + eps);

        test.done();
    },

    rect : function(test){
        var span = vec2.create();
        Nearphase.projectConvexOntoAxis(rect,[1,0],0,[0,1],span);
        test.done();
    },

};

exports.findSeparatingAxis = function(test){
    var axis = vec2.create();
    Nearphase.findSeparatingAxis(circle,[0,0],0,circle,[0,1+eps],0,axis);

    // Check length
    var l = vec2.length(axis);
    test.ok(l > 1-eps);
    test.ok(l < 1+eps);

    // Check direction - should be quite near up/down direction
    var d = vec2.dot(axis, [0,1]);
    test.ok(Math.abs(d) > 1-eps);



    // Check what happens if there is overlap
    Nearphase.findSeparatingAxis(circle,[0,0],0,circle,[0,0.5],0,axis);

    // Check direction - should still be quite near up/down direction
    var d = vec2.dot(axis, [0,1]);
    test.ok(Math.abs(d) > 1-eps);



    // Check what happens if there is diagonal overlap
    Nearphase.findSeparatingAxis(circle,[0,0],0,circle,[0.5,0.5],0,axis);

    // Check direction
    var d = vec2.dot(axis, vec2.normalize([1,1],[1,1]));
    test.ok(Math.abs(d) > 1-eps);



    test.done();
};

exports.getClosestEdge = function(test){
    var i = Nearphase.getClosestEdge(circle, 0, [1,0]);

    // Should be first or last edge
    test.ok(i != -1);

    // Last edge is given by i == vs.length-2 since it is spanned by vs.length-2 to vs.length-1
    test.ok(i==0 || i % (circle.vertices.length-2) == 0);

    test.done();
}
