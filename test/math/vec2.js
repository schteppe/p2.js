var vec2 = require(__dirname + '/../../src/math/vec2');

exports.centroid = function(test){
    var a=[0,0],
        b=[1,0],
        c=[2,3],
        out=[0,0];
    vec2.centroid(out,a,b,c);
    test.deepEqual(out,[1,1]);
    test.done();
};

exports.crossLength = function(test){
    var a=[1,0],
        b=[0,1],
        out=[0,0];
    test.deepEqual(vec2.crossLength(a,b),1);
    test.done();
};

exports.crossVZ = function(test){
    // STUB
    test.done();
};

exports.crossZV = function(test){
    // STUB
    test.done();
};

exports.getX = function(test){
    // STUB
    test.done();
};

exports.getY = function(test){
    // STUB
    test.done();
};

exports.rotate = function(test){
    var a=[1,0],
        out=[0,0];
    vec2.rotate(out,a,Math.PI);
    test.ok(vec2.distance(out,[-1,0])<0.001);
    test.done();
};

exports.setRotation = function(test){
    var a = [0,0];
    vec2.setRotation(a, 0);
    test.deepEqual(a,[0,1]);
    test.done();
};

exports.setIdentityRotation = function(test){
    var a = [0,0];
    vec2.setIdentityRotation(a);
    test.deepEqual(a,[0,1]);
    test.done();
};

exports.getRotationAngle = function(test){
    var a = [0,0];
    var angleA = 0;
    var angleB = 0;

    vec2.setRotation(a, angleA);
    angleB = vec2.getRotationAngle(a);
    test.equal(angleA, angleB);

    angleA = Math.PI;

    vec2.setRotation(a, angleA);
    angleB = vec2.getRotationAngle(a);
    test.equal(angleA, angleB);

    test.done();
};

exports.multiplyRotations = function(test){
    var a = [0,0];
    var b = [0,0];
    var c = [0,0];
    var out = [0,0];

    // 0 + 0
    vec2.setIdentityRotation(a);
    vec2.setIdentityRotation(b);
    vec2.multiplyRotations(out,a,b);
    test.deepEqual(out, [0,1]);

    // pi + pi
    vec2.setRotation(a, Math.PI);
    vec2.setRotation(b, Math.PI);
    vec2.multiplyRotations(out,a,b);
    test.ok(vec2.distance(out, [0,1]) < 0.01);

    // pi/2 + pi/2
    vec2.setRotation(a, Math.PI / 2);
    vec2.setRotation(b, Math.PI / 2);
    vec2.setRotation(c, Math.PI);
    vec2.multiplyRotations(out,a,b);
    test.ok(vec2.distance(out, c) < 0.01);

    test.done();
};

exports.rotateVector = function(test){
    var a = [0,1];
    var rotation = [0,1];
    var out = [0,0];

    vec2.rotateVector(out, a, rotation);
    test.deepEqual(out, [0,1]);

    a = [0,1];
    vec2.setRotation(rotation, Math.PI / 2);
    vec2.rotateVector(out, a, rotation);
    test.ok(vec2.distance(out, [-1,0]) < 0.01);

    test.done();
};

exports.inverseRotateVector = function(test){
    var a = [0,1];
    var rotation = [0,1];
    var out = [0,0];

    vec2.inverseRotateVector(out, a, rotation);
    test.deepEqual(out, [0,1]);

    a = [0,1];
    vec2.setRotation(rotation, Math.PI / 2);
    vec2.inverseRotateVector(out, a, rotation);
    test.ok(vec2.distance(out, [1,0]) < 0.01);

    test.done();
};

exports.vectorToGlobalFrame2 = function(test){
    var a = [0,1];
    var rotation = vec2.setRotation([0,0], Math.PI / 2);
    var out = [0,0];

    vec2.vectorToGlobalFrame2(out, a, rotation);
    test.ok(vec2.distance(out, [-1,0]) < 0.01);

    test.done();
};

exports.toLocalFrame2 = function(test){
    var a = [1,1];
    var position = [1,0];
    var rotation = vec2.setRotation([0,0], Math.PI / 2);
    var out = [0,0];

    vec2.toLocalFrame2(out, a, position, rotation);
    test.ok(vec2.distance(out, [1,0]) < 0.01);

    test.done();
};

exports.toGlobalFrame2 = function(test){
    var a = [1,1];
    var position = [1,0];
    var rotation = vec2.setRotation([0,0], Math.PI / 2);
    var out = [0,0];

    vec2.toGlobalFrame2(out, a, position, rotation);
    test.ok(vec2.distance(out, [0,1]) < 0.01);

    test.done();
};

