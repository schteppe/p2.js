var Solver = require('./Solver').Solver,
    ContactEquation = require('../constraints/ContactEquation').ContactEquation,
    vec2 = require('gl-matrix').vec2,
    STATIC = require('../objects/Body').Body.MotionState.STATIC;

exports.ParallelIslandSolver = ParallelIslandSolver;
exports.Island = Island;

/**
 * Splits the system of bodies and equations into independent islands, and solves them in parallel using Web Workers.
 * @param {p2.Solver} subsolver
 * @param {number} numWorkers
 * @param {string} p2Url
 * @extends {Solver}
 */
function ParallelIslandSolver(subsolver,numWorkers,p2Url){
    Solver.call(this);
    numWorkers = numWorkers || 2;
    p2Url = p2Url || "p2.js";
    this.subsolver = subsolver;
    this.numIslands = 0;
    this._nodePool = [];
    this._workers = [];
    this._workerData = []; // TypedArrays used to transfer data from/to each worker

    var blob = new Blob(['this.onmessage = function(e){\n    var global;\n    importScripts("'+p2Url+'");\n};'],{type: "text/javascript"});

    // Init workers
    for(var i=0; i<numWorkers; i++){
        var worker = new Worker(window.URL.createObjectURL(blob));
        worker.postMessage({});
        var workerData = new Float32Array(1000);
        this._workers.push(worker);
        this._workerData.push(workerData);
    }
};
ParallelIslandSolver.prototype = new Solver();

function getUnvisitedNode(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && !(node.body.motionState & STATIC)){ // correct?
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
ParallelIslandSolver.prototype.solve = function(dt,world,callback){
    var nodes = [],
        bodies=world.bodies,
        equations=this.equations,
        Neq=equations.length,
        Nbodies=bodies.length,
        subsolver=this.subsolver,
        workers = this._workers,
        workerData = this._workerData;

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

    // Get islands
    var islands = [];
    while((child = getUnvisitedNode(nodes))){
        var island = new Island();
        islands.push(island);
        eqs.length = 0;
        bds.length = 0;
        bfs(child,visitFunc); // run search algo to gather an island of bodies

        // Add equations to island
        var Neqs = eqs.length;
        for(var i=0; i!==Neqs; i++){
            //subsolver.addEquation(eqs[i]);
            island.equations.push(eqs[i]);
        }

        /*
        // Solve island
        var dummyWorld = {bodies:bds};
        var iter = subsolver.solve(dt,dummyWorld);
        subsolver.removeAllEquations();
        */
        n++;
    }
    this.numIslands = n;

    // Should try to split the number of equations equally on the workers
    var numWorkerEquations = []; // Number of equations per worker
    var workerIslands = []; // Array of array of islands, islands to be distributed to each worker
    for(var i=0; i<workers.length; i++){
        numWorkerEquations[i] = 0;
        workerIslands.push([]);
    }

    // Distribute islands to solver workers: find worker with least equations
    while(islands.length){
        var island = islands.pop();
        var leastEquations = 0;
        var leastEquationsIdx = 0;
        for(var i=0; i<workers.length; i++){
            if(numWorkerEquations[i] < leastEquations){
                leastEquations = numWorkerEquations;
                leastEquationsIdx = i;
            }
        }
        // Add island to that worker
        workerIslands[leastEquationsIdx].push(island);

        // Calculate new number of equations
        numWorkerEquations[leastEquationsIdx] += island.equations.length;
    }
    
    // Send islands to workers
    for(var i=0; i<workers.length; i++){
        // Compute total storage size needed
        var totalStorageSize = 0;
        for(var j=0; j<workerIslands[i].length; j++){
            totalStorageSize += workerIslands[i][j].storageSize();
        }

        // Resize the array if needed
        workerData[i] = resizeWorkerData(workerData[i],totalStorageSize);

        // pack data into array
        var offset = 0;
        for(var j=0; j<workerIslands[i].length; j++){
            var island = workerIslands[i][j];
            island.toArray(workerData[i],offset);
            offset += island.storageSize();
        }
    }

    callback();

    return n;
};

Island.ARRAY_CHUNK = 10;

function resizeWorkerData(array,requiredElements){
    if(array.length < requiredElements){
        return new Float32Array(requiredElements+Island.ARRAY_CHUNK);
    } else 
        return array;
}

/**
 * An island of bodies connected with equations. Used by ParallelIslandSolver to serialize/unserialize equations and bodies from arrays.
 * @class
 */
function Island(){
    this.equations = [];
    this.bodies = [];
    this._contactEquationPool = [];
    this._bodyPool = [];
}

Island.EquationTypes = {
    CONTACT : 1
};

Island.NUMBERS_PER_BODY = 7;
Island.NUMBERS_PER_EQUATION = {
    1 : 8
};

/**
 * Load bodies and equations from a Float32Array.
 *
 * The file format, which the bodies are stored in, is described below.
 * a[0] : Number of bodies
 * a[1] : Number of equations
 * a[2 to Island.NUMBERS_PER_BODY*N] : Body data
 * a[7*N+1 to end] : Equation data (at least 2 numbers per equation, see Island.NUMBERS_PER_EQUATION)
 * 
 * @param  {Float32Array} a The array to load data from.
 */
Island.prototype.fromArray = function(a,offset){
    // Reset
    while(this.bodies.length){
        this._bodyPool.push(this.bodies.pop());
    }
    while(this.equations.length){
        this._contactEquationPool.push(this.equations.pop());
    }

    // First is always number of bodies and number of equations
    var i = offset,  // Current index in the array
        numEquations = a[i++],
        numBodies = a[i++],
        bodies = {};

    // Parse bodies
    for(var j=0; j<numBodies; j++){
        var body = this._bodyPool.pop() || new Body();

        // Parse body data
        body.id = a[i++];
        vec2.set(body.position,a[i++],a[i++]);
        vec2.set(body.velocity,a[i++],a[i++]);
        body.rotation = a[i++];
        body.angularVelocity = a[i++];

        this.bodies.push(body);
        bodies[body.id] = body;
    }

    // Parse all equations
    for(var j=0; j<numEquations; j++){
        // First is type
        var type = a[i++];

        // Then two body ids
        var id1 = a[i++],
            id2 = a[i++];

        // Then specific constraint data depending on type
        var eq;
        switch(type){
            case Island.EquationTypes.CONTACT:
                eq = this._contactEquationPool.pop() || new ContactEquation();
                // Parse .ri, .rj, and .ni
                vec2.set(eq.ri,a[i++],a[i++]);
                vec2.set(eq.rj,a[i++],a[i++]);
                vec2.set(eq.ni,a[i++],a[i++]);
                break;
            default:
                throw new Error('Equation type not recognized: '+type);
        }

        // Add participating bodies
        eq.bi = bodies[id1];
        eq.bj = bodies[id2];

        this.equations.push(eq);
    }
};

/**
 * Save bodies and equations to a Float32Array.
 * @param  {Float32Array} array The array to save to
 * @return {number} The number of elements the island takes.
 */
Island.prototype.toArray = function(a,offset,num){
    var i = offset,  // Current index in the array
        numBodies =  this.bodies.length,
        numEquations = this.equations.length;
    a[i++] = numEquations;
    a[i++] = numBodies;

    // bodies
    for(var j=0; j<numBodies; j++){
        var b = this.bodies[j],
            p = b.position,
            v = b.velocity;
        a[i++] = body.id;
        a[i++] = p[0];
        a[i++] = p[1];
        a[i++] = v[0];
        a[i++] = v[1];
        a[i++] = body.rotation;
        a[i++] = body.angularVelocity;
    }

    // equations
    for(var j=0; j<numEquations; j++){
        var eq = this.equations[j];

        var type;
        if(eq instanceof ContactEquation)
            type = Island.EquationTypes.CONTACT;
        else
            throw new Error("Equation type not recognized");
        a[i++] = type;

        a[i++] = eq.bi.id;
        a[i++] = eq.bj.id;

        switch(type){
            case Island.EquationTypes.CONTACT:
                // .ri, .rj, and .ni
                a[i++] = eq.ri[0];
                a[i++] = eq.ri[1];
                a[i++] = eq.rj[0];
                a[i++] = eq.rj[1];
                a[i++] = eq.ni[0];
                a[i++] = eq.ni[1];
                break;
            default:
                throw new Error('Equation type not recognized: '+type);
        }
    }
};

/**
 * Calculates the number of array elements needed to store this island.
 * @return {number} Number of array elements it takes to store.
 */
Island.prototype.storageSize = function(){
    // numEquations and numBodies
    var size = 2; 

    // Body data
    size += Island.NUMBERS_PER_BODY * this.bodies.length;

    // Equation data
    var eqs = this.equations;
    var Neq = eqs.length;
    for(var i=0; i!==Neq; i++){
        var eq = eqs[i];
        if(eq instanceof ContactEquation)
            size += Island.NUMBERS_PER_EQUATION[Island.EquationTypes.CONTACT];
    }
}
