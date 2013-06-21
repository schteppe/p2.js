var Solver = require('./Solver').Solver,
    STATIC = require('../objects/Body').Body.MotionState.STATIC;

exports.ParallelIslandSolver = ParallelIslandSolver;

function ParallelIslandSolver(subsolver,numWorkers,p2Url){
    Solver.call(this);
    numWorkers = numWorkers || 2;
    p2Url = p2Url || "p2.js";
    this.subsolver = subsolver;
    this.numIslands = 0;
    this._nodePool = [];
    this._workers = [];

    /*
    var blob = new Blob(['importScripts("'+p2Url+'");\nthis.onmessage = function(e){};'],{type: "text/javascript"});

    // Init workers
    for(var i=0; i<numWorkers; i++){
        var worker = new Worker(window.URL.createObjectURL(blob));
    }
    */
};
ParallelIslandSolver.prototype = new Solver();

function getUnvisitedNode(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && !(node.body.motionState & STATIC)){
            return node;
        }
    }
    return false;
}

function bfs(root,visitFunc){
    var queue = [];
    queue.push(root);
    root.visited = true;
    visitFunc(root);
    while(queue.length) {
        var node = queue.pop();
        // Loop over unvisited child nodes
        var child;
        while((child = getUnvisitedNode(node.children))) {
            child.visited = true;
            visitFunc(child);
            queue.push(child);
        }
    }
}

// Returns the number of subsystems
ParallelIslandSolver.prototype.solve = function(dt,world){
    var nodes = [],
        bodies=world.bodies,
        equations=this.equations,
        Neq=equations.length,
        Nbodies=bodies.length,
        subsolver=this.subsolver;

    // Create needed nodes, reuse if possible
    for(var i=0; i!==Nbodies; i++){
        if(this._nodePool.length)
            nodes.push( this._nodePool.pop() );
        else {
            nodes.push({
                body:bodies[i],
                children:[],
                eqs:[],
                visited:false
            });
        }
    }

    // Reset node values
    for(var i=0; i!==Nbodies; i++){
        var node = nodes[i];
        node.body = bodies[i];
        node.children.length = 0;
        node.eqs.length = 0;
        node.visited = false;
    }

    // Add connectivity data. Each equation connects 2 bodies.
    for(var k=0; k!==Neq; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bi),
            j=bodies.indexOf(eq.bj),
            ni=nodes[i],
            nj=nodes[j];
        ni.children.push(nj);
        ni.eqs.push(eq);
        nj.children.push(ni);
        nj.eqs.push(eq);
    }

    // The BFS search algorithm needs a traversal function. What we do is gather all bodies and equations connected.
    var child, n=0, eqs=[], bds=[];
    function visitFunc(node){
        bds.push(node.body);
        var Neqs = node.eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = node.eqs[i];
            if(eqs.indexOf(eq) === -1){
                eqs.push(eq);
            }
        }
    }

    while((child = getUnvisitedNode(nodes))){
        eqs.length = 0;
        bds.length = 0;
        bfs(child,visitFunc); // run search algo to gather an island of bodies

        // Add equations to solver
        var Neqs = eqs.length;
        for(var i=0; i!==Neqs; i++){
            subsolver.addEquation(eqs[i]);
        }

        // Solve island
        var dummyWorld = {bodies:bds};
        var iter = subsolver.solve(dt,dummyWorld);
        subsolver.removeAllEquations();
        n++;
    }

    this.numIslands = n;

    return n;
};
