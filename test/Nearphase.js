var Nearphase = require("../src/collision/Nearphase")
,   Convex = require("../src/shapes/Convex")
,   Body = require("../src/objects/Body")
,   vec2 = require("../src/math/vec2")

var verts = [];
var N = 50;
for(var i=0; i<N; i++){
    verts.push(vec2.fromValues( Math.cos(2*Math.PI / N * i),
                                Math.sin(2*Math.PI / N * i) ));
}
var shape = new Convex(verts);

exports.projectConvexOntoAxis = function(test){
    var span = vec2.create();
    Nearphase.projectConvexOntoAxis(shape,[1,0],0,[0,1],span);
    test.done();
};

exports.findSeparatingAxis = function(test){
    var axis = vec2.create();
    Nearphase.findSeparatingAxis(shape,[0,0],0,shape,[0,1],0,axis);
    test.done();
};
