var Narrowphase = require(__dirname + '/../../src/collision/Narrowphase')
,   Convex = require(__dirname + "/../../src/shapes/Convex")
,   Circle = require(__dirname + "/../../src/shapes/Circle")
,   Body = require(__dirname + "/../../src/objects/Body")
,   Box = require(__dirname + "/../../src/shapes/Box")
,   Capsule = require(__dirname + "/../../src/shapes/Capsule")
,   Plane = require(__dirname + "/../../src/shapes/Plane")
,   Particle = require(__dirname + "/../../src/shapes/Particle")
,   Line = require(__dirname + "/../../src/shapes/Line")
,   ContactEquation = require(__dirname + "/../../src/equations/ContactEquation")
,   FrictionEquation = require(__dirname + "/../../src/equations/FrictionEquation")
,   vec2 = require(__dirname + "/../../src/math/vec2");

var rect,
    circle,
    convex,
    capsule,
    plane,
    line,
    particle,
    narrowphase,
    bodyA,
    bodyB,
    position=[0,0],
    angle=0,
    eps = 0.01;

exports.setUp = function(callback){

    // Rect
    rect = new Box();

    // Circle
    var verts = [];
    var N = 50;
    for(var i=0; i<N; i++){
        verts.push(vec2.fromValues( Math.cos(2*Math.PI / N * i),
                                    Math.sin(2*Math.PI / N * i) ));
    }
    circle = new Circle({ radius: 1 });
    convex = new Convex({ vertices: verts });
    capsule = new Capsule({ length: 1, radius: 1 });
    plane = new Plane();
    particle = new Particle();
    line = new Line();

    narrowphase = new Narrowphase();

    bodyA = new Body();
    bodyB = new Body();

    callback();
};

exports.construct = function(test){
    var narrowphase = new Narrowphase();
    test.done();
};

exports.capsuleCapsule = function(test){
    var result = narrowphase.capsuleCapsule(bodyA, capsule, position, angle, bodyB, capsule, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.capsuleCapsule(bodyA, capsule, position, angle, bodyB, capsule, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.planeCapsule = function(test){
    var result = narrowphase.planeCapsule(bodyA, plane, position, angle, bodyB, capsule, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.planeCapsule(bodyA, plane, position, angle, bodyB, capsule, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.circleCapsule = function(test){
    var result = narrowphase.circleCapsule(bodyA, circle, position, angle, bodyB, capsule, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.circleCapsule(bodyA, circle, position, angle, bodyB, capsule, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.circleCircle = function(test){
    var result = narrowphase.circleCircle(bodyA, circle, position, angle, bodyB, circle, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.circleCircle(bodyA, circle, position, angle, bodyB, circle, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.circleConvex = function(test){
    var result = narrowphase.circleConvex(bodyA, circle, position, angle, bodyB, convex, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.circleConvex(bodyA, circle, position, angle, bodyB, convex, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.circleLine = function(test){
    var result = narrowphase.circleLine(bodyA, circle, position, angle, bodyB, line, position, angle);
    test.equal(typeof result, 'number');

    var result = narrowphase.circleLine(bodyA, circle, position, angle, bodyB, line, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.circleParticle = function(test){
    var result = narrowphase.circleParticle(bodyA, circle, position, angle, bodyB, particle, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.circleParticle(bodyA, circle, position, angle, bodyB, particle, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.circlePlane = function(test){
    var result = narrowphase.circlePlane(bodyA, circle, position, angle, bodyB, plane, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.circlePlane(bodyA, circle, position, angle, bodyB, plane, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.collidedLastStep = function(test){
    test.equal(typeof narrowphase.collidedLastStep(bodyA, bodyB), 'boolean');
    test.done();
};

exports.convexCapsule = function(test){
    var result = narrowphase.convexCapsule(bodyA, convex, position, angle, bodyB, capsule, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.convexCapsule(bodyA, convex, position, angle, bodyB, capsule, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.convexConvex = function(test){
    var result = narrowphase.convexConvex(bodyA, convex, position, angle, bodyB, convex, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.convexConvex(bodyA, convex, position, angle, bodyB, convex, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.convexLine = function(test){
    var result = narrowphase.convexLine(bodyA, convex, position, angle, bodyB, line, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.convexLine(bodyA, convex, position, angle, bodyB, line, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.planeConvex = function(test){
    var result = narrowphase.planeConvex(bodyA, plane, position, angle, bodyB, convex, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.planeConvex(bodyA, plane, position, angle, bodyB, convex, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.createContactEquation = function(test){
    var contact = narrowphase.createContactEquation(bodyA, bodyB, plane, rect);
    test.ok(contact instanceof ContactEquation);
    test.done();
};

exports.createFrictionEquation = function(test){
    var eq = narrowphase.createFrictionEquation(bodyA, bodyB, plane, rect);
    test.ok(eq instanceof FrictionEquation);
    test.done();
};

exports.createFrictionFromContact = function(test){
    // STUB
    test.done();
};

exports.findSeparatingAxis = function(test){
    var axis = vec2.create();
    Narrowphase.findSeparatingAxis(convex,[0,0],0,convex,[0,1+eps],0,axis);

    // Check length
    var l = vec2.length(axis);
    test.ok(l > 1-eps);
    test.ok(l < 1+eps);

    // Check direction - should be quite near up/down direction
    var d = vec2.dot(axis, [0,1]);
    test.ok(Math.abs(d) > 1-eps);



    // Check what happens if there is overlap
    Narrowphase.findSeparatingAxis(convex,[0,0],0,convex,[0,0.5],0,axis);

    // Check direction - should still be quite near up/down direction
    var d = vec2.dot(axis, [0,1]);
    test.ok(Math.abs(d) > 1-eps);



    // Check what happens if there is diagonal overlap
    Narrowphase.findSeparatingAxis(convex,[0,0],0,convex,[0.5,0.5],0,axis);

    // Check direction
    var d = vec2.dot(axis, vec2.normalize([1,1],[1,1]));
    test.ok(Math.abs(d) > 1-eps);

    test.done();
};

exports.getClosestEdge = function(test){
    var i = Narrowphase.getClosestEdge(convex, 0, [1,0]);

    // Should be first or last edge
    test.ok(i !== -1);

    // Last edge is given by i == vs.length-2 since it is spanned by vs.length-2 to vs.length-1
    test.ok(i===0 || i % (convex.vertices.length-2) === 0);

    test.done();
};

exports.lineCapsule = function(test){
    var result = narrowphase.lineCapsule(bodyA, line, position, angle, bodyB, capsule, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.lineCapsule(bodyA, line, position, angle, bodyB, capsule, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.lineLine = function(test){
    var result = narrowphase.lineLine(bodyA, line, position, angle, bodyB, line, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.lineLine(bodyA, line, position, angle, bodyB, line, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.lineBox = function(test){
    var result = narrowphase.lineBox(bodyA, line, position, angle, bodyB, rect, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.lineBox(bodyA, line, position, angle, bodyB, rect, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.particleConvex = function(test){
    var result = narrowphase.particleConvex(bodyA, particle, position, angle, bodyB, convex, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.particleConvex(bodyA, particle, position, angle, bodyB, convex, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.particlePlane = function(test){
    var result = narrowphase.particlePlane(bodyA, particle, position, angle, bodyB, plane, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.particlePlane(bodyA, particle, position, angle, bodyB, plane, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.planeLine = function(test){
    var result = narrowphase.planeLine(bodyA, plane, position, angle, bodyB, line, position, angle);
    test.equal(typeof result, 'number');

    result = narrowphase.planeLine(bodyA, plane, position, angle, bodyB, line, position, angle, true);
    test.equal(typeof result, 'boolean');

    test.done();
};

exports.projectConvexOntoAxis = function(test){
    var span = vec2.create();

    // Moved along axis propendicular to the projection axis
    Narrowphase.projectConvexOntoAxis(convex,[1,0],0,[0,1],span);

    test.ok(span[0] > -1 - eps);
    test.ok(span[0] < -1 + eps);
    test.ok(span[1] > 1 - eps);
    test.ok(span[1] < 1 + eps);

    // Along the x axis
    Narrowphase.projectConvexOntoAxis(convex,[0,1],0,[0,1],span);

    test.ok(span[0] > 0 - eps);
    test.ok(span[0] < 0 + eps);
    test.ok(span[1] > 2 - eps);
    test.ok(span[1] < 2 + eps);

    // Along the x axis - rotated 180 degrees - should not do anything special
    Narrowphase.projectConvexOntoAxis(convex,[0,1],Math.PI / 2,[0,1],span);

    test.ok(span[0] > 0 - eps);
    test.ok(span[0] < 0 + eps);
    test.ok(span[1] > 2 - eps);
    test.ok(span[1] < 2 + eps);

    var span = vec2.create();
    Narrowphase.projectConvexOntoAxis(rect,[1,0],0,[0,1],span);
    test.done();
};

exports.reset = function(test){
    var contact = narrowphase.createContactEquation(bodyA, bodyB, plane, rect);
    narrowphase.contactEquations.push(contact);
    narrowphase.reset();
    test.equal(narrowphase.contactEquations.length, 0);
    test.equal(narrowphase.frictionEquations.length, 0);
    test.done();
};


exports.bodiesOverlap = function(test){
    bodyA.addShape(new Circle({ radius: 1 }));
    bodyB.addShape(new Circle({ radius: 1 }));
    test.ok(narrowphase.bodiesOverlap(bodyA, bodyB));
    bodyB.position[0] = 10;
    test.ok(!narrowphase.bodiesOverlap(bodyA, bodyB));
    test.done();
};

