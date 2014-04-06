var GridBroadphase = require(__dirname + '/../../src/collision/GridBroadphase');

exports.construct = function(test){
    var options = {
        xmin:   1,
        xmax:   2,
        ymin:   3,
        ymax:   4,
        nx:     5,
        ny:     6
    };
    var b = new GridBroadphase(options);
    for(var key in options){
        test.equal(b[key], options[key]);
    }

    b = new GridBroadphase();
    test.ok(b.xmin,'should set default values');

    test.done();
};

exports.getBinIndex = function(test){
    // STUB
    test.done();
};

exports.getCollisionPairs = function(test){
    // STUB
    test.done();
};

