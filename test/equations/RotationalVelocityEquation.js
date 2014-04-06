var RotationalVelocityEquation = require(__dirname + '/../../src/equations/RotationalVelocityEquation');
var Body = require(__dirname + '/../../src/objects/Body');

exports.construct = function(test){
    var bodyA = new Body();
    var bodyB = new Body();
    var eq = new RotationalVelocityEquation(bodyA, bodyB);
    test.done();
};

