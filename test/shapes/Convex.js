var Convex = require(__dirname + '/../../src/shapes/Convex')
,   vec2 =   require(__dirname + '/../../src/math/vec2')
,   AABB =   require(__dirname + '/../../src/collision/AABB')

exports.construct = function(test){
    new Convex([]);

    test.throws(function(){
        var c = new Convex([[-1,-1],
                            [-1, 1],
                            [ 1, 1],
                            [ 1,-1]]);
    },"Should throw exception on clockwise winding.");

    test.done();
};

exports.computeAABB = function(test){
    var w = 2,
        h = 1;
    var c = new Convex([
        [-w/2,-h/2],
        [ w/2,-h/2],
        [ w/2, h/2],
        [-w/2, h/2],
    ]);

    var aabb = new AABB();
    c.computeAABB(aabb,[1,2],0);

    test.equal(aabb.lowerBound[0],-w/2 + 1);
    test.equal(aabb.lowerBound[1],-h/2 + 2);
    test.equal(aabb.upperBound[0], w/2 + 1);
    test.equal(aabb.upperBound[1], h/2 + 2);

    test.done();
};

exports.computeMomentOfInertia = function(test){
    var w = 2,
        h = 1;
    var c = new Convex([
        [-w/2,-h/2],
        [ w/2,-h/2],
        [ w/2, h/2],
        [-w/2, h/2],
    ]);
    var mass = 1;
    var I = c.computeMomentOfInertia(mass);
    var boxInertia = mass*(h*h+w*w)/12;
    test.ok(Math.abs(I-boxInertia) < 0.01,'Convex dont compute square inertia correctly');
    test.done();
};

exports.triangleArea = function(test){
    test.equal( Convex.triangleArea([0, 0], [1, 0], [1, 1]),  1/2);
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
    var w = 2,
        h = 1;
    var c = new Convex([
        [-w/2,-h/2],
        [ w/2,-h/2],
        [ w/2, h/2],
    ]);

    test.equal(c.boundingRadius, Math.sqrt(w*w/4+h*h/4));

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
    var w = 2,
        h = 1;
    var c = new Convex([
        [-w/2,-h/2],
        [ w/2,-h/2],
        [ w/2, h/2],
    ]);
    c.updateTriangles();
    test.deepEqual([ [ 0, 1, 2 ] ],c.triangles);

    test.done();
};

