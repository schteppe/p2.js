var Convex = require('../src/shapes/Convex')
,   vec2 = require('../src/math/vec2')

exports.construct = function(test){
    new Convex();
    test.done();
};

exports.updateCenterOfMass = function(test){

    // Test with box
    var c = new Convex([[-1,-1],
                        [ 1,-1],
                        [ 1, 1],
                        [-1, 1]]);
    c.updateCenterOfMass();
    test.equal(c.centerOfMass[0],0);
    test.equal(c.centerOfMass[1],0);

    // rotate and translate all points
    var offset = vec2.fromValues(1,1);
    for(var i=0; i!==c.vertices.length; i++){
        var v = c.vertices[i];
        vec2.rotate(v,v,Math.PI/4);
        vec2.add(v,v,offset);
    }

    c.updateCenterOfMass();

    test.ok(Math.abs(c.centerOfMass[0]-offset[0]) < 0.01);
    test.ok(Math.abs(c.centerOfMass[1]-offset[1]) < 0.01);

    test.done();
};
