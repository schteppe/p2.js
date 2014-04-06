var RotationalLockEquation = require(__dirname + '/../../src/equations/RotationalLockEquation');
var Body = require(__dirname + '/../../src/objects/Body');

exports.construct = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var eq = new RotationalLockEquation(bodyA, bodyB);
    test.done();
};

