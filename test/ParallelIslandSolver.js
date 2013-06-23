var pis = require('../src/solver/ParallelIslandSolver')
,   ParallelIslandSolver = pis.ParallelIslandSolver
,   Island = pis.Island
,   IslandGroup = pis.IslandGroup
,   GSSolver = require('../src/solver/GSSolver').GSSolver
,   Body = require('../src/objects/Body').Body
,   ContactEquation = require('../src/constraints/ContactEquation').ContactEquation

var group, bi, bj, eq, island;

exports.IslandGroup = {

    setUp : function(callback){

        group = new IslandGroup();
        bi = new Body();
        bj = new Body();
        eq = new ContactEquation(bi,bj);
        island = new Island();
        island.equations.push(eq);
        island.bodies.push(bi);
        island.bodies.push(bj);
        group.islands.push(island);

        callback();
    },

    toAndFromArray : function(test){
        var a = new Float32Array(1000);
        group.toArray(a);
        group.fromArray(a);

        // Assert we got the same ids back
        test.equal(bi.id, group.islands[0].bodies[0].id)
        test.equal(bj.id, group.islands[0].bodies[1].id)

        test.done();
    },

    resultToAndFromArray : function(test){
        bi.vlambda[0] = 1;
        var a = new Float32Array(10);
        group.resultToArray(a);
        group.applyResult(a);

        test.equal(bi.velocity[0],1);

        test.done();
    },

    solve : function(test){
        group.solve(1/60,new GSSolver(), function(){
            test.done();
        });
    },
};
