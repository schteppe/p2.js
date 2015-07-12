var Capsule = require(__dirname + '/../../src/shapes/Capsule');
var Ray = require(__dirname + '/../../src/collision/Ray');
var RaycastResult = require(__dirname + '/../../src/collision/RaycastResult');

exports.construct = function(test){
    var capsule = new Capsule({ length: 2, radius: 3 });
    test.equal(capsule.length, 2);
    test.equal(capsule.radius, 3);
    test.done();
};

exports.computeAABB = function(test){
    // STUB
    test.done();
};

exports.computeMomentOfInertia = function(test){
    // STUB
    test.done();
};

exports.raycast = function(test){
    var ray = new Ray({
        mode: Ray.CLOSEST,
        from: [0,0],
        to: [10,0]
    });

    var capsule = new Capsule({ length: 1, radius: 0.5 });
    var result = new RaycastResult();
    capsule.raycast(result, ray, [1,0], Math.PI / 2);

    test.done();
};

