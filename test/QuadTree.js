var qtree = require('../src/collision/QuadTree')
,   QuadTree = qtree.QuadTree

exports.setUp = function(callback){
    callback();
};

exports.example = function(test){
    var bounds = {
        x:0,
        y:0,
        width:100,
        height:100
    }
    var quad = new QuadTree(bounds);

    // insert a random object
    quad.insert({
        x:12,
        y:25,
        height:10,
        width:25
    });

    var items = quad.retrieve({x:11, y:20, height:10, width:20});

    test.equal(items.length, 1);

    test.done();
};

exports.example2 = function(test){
    var pointQuad = true;
    var bounds = {
                x:0,
                y:0,
                width:100,
                height:100
    }
    var quad = new QuadTree(bounds, pointQuad);

    //insert a random point
    quad.insert({x:12, y:25});

    var items = quad.retrieve({x:11, y:20});
    test.done();
};
