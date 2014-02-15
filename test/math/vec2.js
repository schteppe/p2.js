var vec2 = require(__dirname + '/../../src/math/vec2');

exports.construct = function(test){
    // STUB
    test.done();
};

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

