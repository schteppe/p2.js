var Convex = require(__dirname + '/../../src/shapes/Convex');

exports.construct = function(test){
    new Convex();

    test.throws(function(){
        var c = new Convex([[-1,-1],
                            [-1, 1],
                            [ 1, 1],
                            [ 1,-1]]);
    },"Should throw exception on non-clockwise winding.");

    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.conputeMomentOfInertia = function(test){
    // STUB
    test.done();
};

exports.triangleArea = function(test){
    // STUB
    test.done();
};

exports.updateArea = function(test){
    var c = new Convex([[-1,-1],
                        [ 1,-1],
                        [ 1, 1],
                        [-1, 1]]);
    c.updateArea();
    test.equal(c.area, 4)

    var c = new Convex([
        [990, 0],
        [990, 10],
        [0, 10],
        [0, 0]
    ]);
    test.equal(c.area,9900);

    test.done();
};

exports.updateBoundingRadius = function(test){
    // STUB
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

exports.updateTriangles = function(test){
    // STUB
    test.done();
};

