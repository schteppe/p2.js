var broadphase = require("../src/collision/Broadphase");
var Convex = require("../src/objects/Shape").Convex;
var Body = require("../src/objects/Body").Body;
var vec2 = require("gl-matrix").vec2;

var verts = [];
var N = 50;
for(var i=0; i<N; i++){
    verts.push(vec2.fromValues( Math.cos(2*Math.PI / N * i),
                                Math.sin(2*Math.PI / N * i) ));
}
var shape = new Convex(verts);

exports.projectConvexOntoAxis = function(test){
    var span = vec2.create();
    var b = new Body({ shape:shape });
    broadphase.projectConvexOntoAxis(b,vec2.fromValues(1,0),span);
    test.done();
};

exports.findSeparatingAxis = function(test){
    var axis = vec2.create();

    var c1 = new Body({ shape:shape });
    var c2 = new Body({ shape:shape, position:[0,1] });

    broadphase.findSeparatingAxis(c1,c2,axis);
    test.done();
};

exports.nearphaseConvexConvex = function(test){
    var axis = vec2.create();

    var c1 = new Body({ shape:shape });
    var c2 = new Body({ shape:shape, position:[0,1] });

    broadphase.findSeparatingAxis(c1,c2,axis);
    broadphase.nearphaseConvexConvex(c1,c2,axis);
    test.done();
};
