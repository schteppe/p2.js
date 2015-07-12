var Shape = require(__dirname + '/../../src/shapes/Shape');

exports.construct = function(test){
    var shape = new Shape();
    test.done();
};
