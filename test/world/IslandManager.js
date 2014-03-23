var World = require(__dirname + '/../../src/world/World')
,   Body = require(__dirname + '/../../src/objects/Body')
,   IslandManager = require(__dirname + '/../../src/world/IslandManager')
,   IslandNode = require(__dirname + '/../../src/world/IslandNode')
,   Equation = require(__dirname + '/../../src/equations/Equation')
,   DistanceConstraint = require(__dirname + '/../../src/constraints/DistanceConstraint')

exports.construct = function(test){
    new IslandManager();
    test.done();
};

exports.getUnvisitedNode = function(test){
    var node = IslandManager.getUnvisitedNode([]);
    test.equal(node,false);

    node = IslandManager.getUnvisitedNode([new IslandNode(new Body())]);
    test.ok(!node);

    node = IslandManager.getUnvisitedNode([new IslandNode(new Body({ mass:1 }))]);
    test.ok(node instanceof IslandNode);

    test.done();
};

exports.visit = function(test){
    var manager = new IslandManager();
    manager.visit(new IslandNode(new Body()),[],[]);
    test.done();
};

exports.bfs = function(test){
    var manager = new IslandManager();
    var bodyA = new Body({ mass:1 });
    var bodyB = new Body({ mass:1 });
    var nodeA = new IslandNode(bodyA);
    var nodeB = new IslandNode(bodyB);

    var bodies=[],
        equations=[];
    manager.bfs(nodeA,bodies,equations);
    test.deepEqual(bodies,[bodyA]);

    var eq = new Equation(bodyA,bodyB);
    nodeA.neighbors.push(nodeB);
    nodeA.equations.push(eq);
    nodeB.neighbors.push(nodeA);
    nodeB.equations.push(eq);
    bodies = [];
    equations = [];
    manager.bfs(nodeA,bodies,equations);
    test.deepEqual(bodies,[bodyA,bodyB]);
    test.deepEqual(equations,[eq]);

    test.done();
};

exports.split = function(test){
    var world = new World();
    var islands = world.islandManager.split(world);
    test.equal(islands.length,0);

    var bodyA = new Body({ mass:1 });
    var bodyB = new Body({ mass:1 });
    world.addBody(bodyA);
    world.addBody(bodyB);
    world.islandManager.equations.push(new Equation(bodyA,bodyB));
    islands = world.islandManager.split(world);
    test.equal(islands.length,1);

    test.done();
};