var Material = require(__dirname + '/../../src/material/Material');

exports.construct = function(test){
    var material1 = new Material();
    var material2 = new Material();
    test.notEqual(material1.id, material2.id);
    test.done();
};

