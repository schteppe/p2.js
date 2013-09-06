var Solver = require('./Solver').Solver
,   ContactEquation = require('../constraints/ContactEquation').ContactEquation
,   vec2 = require('gl-matrix').vec2
,   Body = require('../objects/Body').Body
,   STATIC = Body.MotionState.STATIC

exports.ParallelIslandSolver = ParallelIslandSolver;
exports.Island = Island;
exports.IslandGroup = IslandGroup;

/**
 * Splits the system of bodies and equations into independent islands, and solves them in parallel using Web Workers.
 *
 * @class ParallelIslandSolver
 * @param {Solver} subsolver
 * @param {number} numWorkers
 * @param {string} p2Url URL to the p2 library. Needed by workers.
 * @extends Solver
 */
function ParallelIslandSolver(subsolver,numWorkers,p2Url){
    Solver.call(this);
    numWorkers = numWorkers || 2;
    p2Url = p2Url || "p2.js";
    var that = this;

    /**
     * The solver used in the workers.
     * @member {p2.Solver}
     * @memberof ParallelIslandSolver
     */
    this.subsolver = subsolver;

    /**
     * Number of islands
     * @member {number}
     * @memberof ParallelIslandSolver
     */
    this.numIslands = 0;

    this._nodePool = [];
    this._workers = [];      // All webworkers
    this._workerData = [];   // TypedArrays used to transfer data from/to each worker
    this._workerBodies = []; // Needed to keep track of the total order of bodies in each worker
    this._workerIslandGroups = [];
    this._numWorking = 0;    // Keep track of how many workers are working
    this._stepDoneCallback = function(){};

    var blob = new Blob([[
        'importScripts("'+p2Url+'");',
        'var id = 0; // Worker id',
        'var dt = 1/60; // Solve timestep',
        'var islandGroup = new p2.IslandGroup();',
        'var solver;',
        'this.onmessage = function(e){',
        '    var that=this;',
        '    if(typeof(e.data.id)!="undefined"){',
        '        id = parseInt(e.data.id);',
        '        dt = e.data.timeStep;',
        '        solver = new p2.GSSolver(); // Todo: user picked solver',
        '        solver.setSpookParams(1e10,3);',
        '        solver.iterations = 20; // and other params',
        '        return;',
        '    } else {',
        '        // Parse islands and solve',
        '        var array = e.data;',
        '        islandGroup.fromArray(array);',
        '        islandGroup.solve(dt,solver,function(){',
        '            islandGroup.resultToArray(array);',
        '            that.postMessage(array,[array.buffer]);',
        '            islandGroup.reset();',
        '        });',
        '    }',
        '};'
    ].join('\n')],{type: "text/javascript"});
    var blobUrl = window.URL.createObjectURL(blob);

    function handleWorkerMessage(e){
        var workerId = that._workers.indexOf(this);
        var group = that._workerIslandGroups[workerId];

        // Apply result data
        group.applyResult(e.data);
        group.reset();

        that._workerData[workerId] = e.data; // Release the worker array

        // Check if we are done
        that._numWorking--;
        if(that._numWorking==0)
            that._stepDoneCallback();
    }

    // Init workers
    for(var i=0; i<numWorkers; i++){
        var worker = new Worker(blobUrl);
        worker.onmessage = handleWorkerMessage;
        worker.postMessage({ id : i, timeStep : 1/60 }); // todo apply user timestep
        var workerData = new Float32Array(100);
        this._workers.push(worker);
        this._workerData.push(workerData);
        this._workerIslandGroups.push(new IslandGroup());
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
        workerData = this._workerData,
        workerIslandGroups = this._workerIslandGroups;

    // To be run later
    this._stepDoneCallback = callback;

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

    // Reset all groups
    for(var i=0; i<workerIslandGroups.length; i++)
        workerIslandGroups[i].reset();

    // Get islands
    var islands = [];
    while((child = getUnvisitedNode(nodes))){
        var island = new Island(); // @todo Should be reused from somewhere
        eqs.length = 0;
        bds.length = 0;
        bfs(child,visitFunc); // run search algo to gather an island of bodies

        // Add equations to island
        var Neqs = eqs.length;
        for(var i=0; i!==Neqs; i++){
            var eq = eqs[i];
            island.equations.push(eq);
        }

        n++;
        islands.push(island);
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
        var leastEquations = Infinity;
        var leastEquationsIdx = 0;
        for(var i=0; i<workers.length; i++){
            var numEq = workerIslandGroups[i].numEquations();
            if(numEq < leastEquations){
                leastEquations = numEq;
                leastEquationsIdx = i;
            }
        }

        // Add island to that worker
        workerIslandGroups[leastEquationsIdx].islands.push(island);
    }

    // Send island groups to workers
    for(var i=0; i!==workers.length; i++){
        var group = workerIslandGroups[i];

        if(group.islands.length){ // Only work if there's work

            // Get storage size
            var size = group.storageSize();

            // Resize the array if needed
            workerData[i] = resizeWorkerData(workerData[i], size);

            // Store data into array
            group.toArray(workerData[i]);

            // Send to worker
            this._numWorking++;
            workers[i].postMessage(workerData[i],[workerData[i].buffer]);
        }
    }
};

Island.ARRAY_CHUNK = 0;

// Internal function for expanding data arrays
function resizeWorkerData(array,requiredElements){
    if(array.length < requiredElements){
        return new Float32Array(requiredElements+Island.ARRAY_CHUNK);
    } else {
        return array;
    }
}

/**
 * An island of bodies connected with equations. Used by ParallelIslandSolver to serialize/unserialize equations and bodies from arrays.
 * @class
 */
function Island(){

    /**
     * Current equations in this island.
     * @member {Array}
     * @memberof Island
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @member {Array}
     * @memberof Island
     */
    this.bodies = [];

    this._contactEquationPool = [];
    this._bodyPool = [];
}

Island.EquationTypes = {
    CONTACT : 1
};
Island.getEquationTypes = function(){
    var result = [];
    for(var key in Island.EquationTypes)
        result.push(Island.EquationTypes[key]);
    return result;
};

Island.NUMBERS_PER_BODY = 12;
Island.NUMBERS_PER_EQUATION = {
    1 : 11
};


/**
 * Clean this island from bodies and equations.
 * @method
 * @memberof Island
 */
Island.prototype.reset = function(){
    // Reset. Store bodies and equations for later
    while(this.bodies.length){
        this._bodyPool.push(this.bodies.pop());
    }
    while(this.equations.length){
        this._contactEquationPool.push(this.equations.pop());
    }
}

/**
 * Load bodies and equations from a Float32Array.
 *
 * The file format, which the bodies are stored in, is described below.
 * a[0] : Number of bodies
 * a[1] : Number of equations
 * a[2 to Island.NUMBERS_PER_BODY*N] : Body data
 * a[7*N+1 to end] : Equation data (at least 2 numbers per equation, see Island.NUMBERS_PER_EQUATION)
 *
 * @method
 * @memberof Island
 * @param  {Float32Array} a The array to load data from.
 * @return {number} The array index immediately after the last one parsed.
 */
Island.prototype.fromArray = function(a,offset){
    offset = offset || 0;

    this.reset();

    // First is always number of bodies and number of equations
    var i = offset,  // Current index in the array
        numEquations = a[i++],
        numBodies = a[i++],
        bodies = {};

    //throw new Error(" ("+numBodies+" bodies, "+numEquations+" eqs)");

    // Parse bodies
    for(var j=0; j<numBodies; j++){
        var body = this._bodyPool.pop() || new Body();

        // Parse body data
        body.id = a[i++];
        vec2.set(body.position,a[i++],a[i++]);
        vec2.set(body.velocity,a[i++],a[i++]);
        body.angle = a[i++];
        body.angularVelocity = a[i++];
        body.mass = a[i++];
        body.inertia = a[i++];

        if(body.mass < 0) body.mass = 0;
        if(body.inertia < 0) body.inertia = 0;

        vec2.set(body.force,a[i++],a[i++]);
        body.angularForce = a[i++];

        body.invMass    = body.mass > 0 ? 1 / body.mass : 0;
        body.invInertia = body.inertia > 0 ? 1 / body.inertia : 0;

        this.bodies.push(body);
        bodies[body.id+""] = body;
    }

    var types = Island.getEquationTypes();


    if(i>a.length){
        throw new Error("Trying to read element "+i+" of an array of length "+a.length+" ("+numBodies+" bodies, "+numEquations+" eqs)");
    }

    // Parse all equations
    for(var j=0; j<numEquations; j++){
        // First is type
        var type = a[i++];
        if(types.indexOf(type)===-1){
            throw new Error("Equation "+j+" (out of "+numEquations+") type not recognized: "+type);
        }

        // Then two body ids
        var id1 = a[i++],
            id2 = a[i++];

        // Then the force range
        var minForce = a[i++],
            maxForce = a[i++];

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
        eq.bi = bodies[id1+""];
        eq.bj = bodies[id2+""];
        if(!eq.bi)
            throw new Error("Body "+id1+" not found");
        if(!eq.bj)
            throw new Error("Body "+id2+" not found");

        eq.minForce = minForce;
        eq.maxForce = maxForce;

        this.equations.push(eq);
    }

    return i;
};

/**
 * Save bodies and equations to a Float32Array.
 *
 * @method
 * @memberof Island
 * @param  {Float32Array} array The array to save to
 * @return {number} The number of elements the island takes.
 */
Island.prototype.toArray = function(a,offset){
    var i = offset,  // Current index in the array
        bodies = this.getBodies(),
        numBodies = bodies.length,
        numEquations = this.equations.length;
    a[i++] = numEquations;
    a[i++] = numBodies;

    // bodies
    for(var j=0; j<numBodies; j++){
        var b = bodies[j],
            p = b.position,
            v = b.velocity;
        a[i++] = b.id;
        a[i++] = p[0];
        a[i++] = p[1];
        a[i++] = v[0];
        a[i++] = v[1];
        a[i++] = b.angle;
        a[i++] = b.angularVelocity;
        a[i++] = b.mass;
        a[i++] = b.inertia;
        a[i++] = b.force[0];
        a[i++] = b.force[1];
        a[i++] = b.angularForce;
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
        a[i++] = eq.minForce;
        a[i++] = eq.maxForce;

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

    return i; // offset immediately after last
};

/**
 * Calculates the number of array elements needed to store this island.
 * @method
 * @memberof Island
 * @return {number} Number of array elements it takes to store.
 */
Island.prototype.storageSize = function(){
    // numEquations and numBodies
    var size = 2;

    // Body data
    size += Island.NUMBERS_PER_BODY * this.getBodies().length;

    // Equation data
    var eqs = this.equations;
    var Neq = eqs.length;
    for(var i=0; i!==Neq; i++){
        var eq = eqs[i];
        if(eq instanceof ContactEquation)
            size += Island.NUMBERS_PER_EQUATION[Island.EquationTypes.CONTACT];
        else
            throw new Error("Equation type not recognized!");
    }

    return size;
};

/**
 * Get all unique bodies in this island.
 * @method
 * @memberof Island
 * @return {Array} An array of Body
 */
Island.prototype.getBodies = function(){
    var bodies = [],
        bodyIds = [],
        eqs = this.equations;
    for(var i=0; i!==eqs.length; i++){
        var eq = eqs[i];
        if(bodyIds.indexOf(eq.bi.id)===-1){
            bodies.push(eq.bi);
            bodyIds.push(eq.bi.id);
        }
        if(bodyIds.indexOf(eq.bj.id)===-1){
            bodies.push(eq.bj);
            bodyIds.push(eq.bj.id);
        }
    }
    return bodies;
};

/**
 * Container for a number of islands.
 * @class
 */
function IslandGroup(){

    /**
     * Current islands in the group.
     * @member {Array}
     * @memberof IslandGroup
     */
    this.islands = [];

    this._islandPool = []; // Left over islands
};

/**
 * Removes all islands from this group.
 * @method
 * @memberof IslandGroup
 */
IslandGroup.prototype.reset = function(){
    while(this.islands.length){
        var island = this.islands.pop();
        island.reset();
        this._islandPool.push(island);
    }
};

/**
 * Computes the total number of equations in this island group.
 * @method
 * @memberof IslandGroup
 * @return {number}
 */
IslandGroup.prototype.numEquations = function(){
    var islands = this.islands,
        numIslands = islands.length,
        total = 0;
    for(var i=0; i!==numIslands; i++){
        total += islands[i].equations.length;
    }
    return total;
};

/**
 * Compute the total storage size of equations and bodies.
 * @method
 * @memberof IslandGroup
 * @return {number}
 */
IslandGroup.prototype.storageSize = function(){
    var islands = this.islands;

    // Compute total storage size needed
    var totalStorageSize = 1;
    for(var j=0; j<islands.length; j++){
        var s = islands[j].storageSize();
        totalStorageSize += s;
    }

    return totalStorageSize;
};

/**
 * Store all the bodies and equations.
 * @method
 * @memberof IslandGroup
 * @param  {Float32Array} a
 */
IslandGroup.prototype.toArray = function(a){
    var islands = this.islands;

    // pack data into array
    var offset = 0;

    // First is number of islands
    a[offset++] = this.islands.length;

    for(var j=0; j<islands.length; j++){
        var island = islands[j];
        offset = island.toArray(a,offset);
    }
};

/**
 * Parses a group of islands from an array
 * @method
 * @memberof IslandGroup
 * @param  {Float32Array} a
 */
IslandGroup.prototype.fromArray = function(a){
    var islands = this.islands;

    this.reset();

    // Parse islands
    var offset = 0,
        numIslands=a[offset++];

    while(islands.length < numIslands)
        this.islands.push(this._islandPool.pop() || new Island());

    for(var i=0; i<numIslands; i++){
        var island = this.islands[i]; // numIslands-1
        offset = island.fromArray(a,offset);
    }
};

/**
 * Solves all constraints in the group of islands.
 * @method
 * @memberof IslandGroup
 * @param  {number} dt
 * @param  {p2.Solver} solver
 */
IslandGroup.prototype.solve = function(dt,solver,callback){
    var islands = this.islands,
        numIslands = islands.length,
        bodies = [];

    solver.removeAllEquations();

    // Add equations to solver
    for(var i=0; i!==numIslands; i++){
        var island = islands[i];
        var numEquations = island.equations.length;
        for(var j=0; j!==numEquations; j++){
            solver.addEquation(island.equations[j]);
        }
        var islandBodies = island.getBodies();
        var numBodies = islandBodies.length;
        for(var j=0; j!==numBodies; j++){
            bodies.push(islandBodies[j]);
        }
    }

    // Solve
    solver.solve(dt,{bodies:bodies},callback);
};

/**
 * Packs resulting constraint velocities to an array.
 * @method
 * @memberof IslandGroup
 * @param {Float32Array} a
 */
IslandGroup.prototype.resultToArray = function(a){
    var islands=this.islands,
        numIslands = islands.length,
        i=0;

    for(var j=0; j!==numIslands; j++){
        var bodies = islands[j].getBodies(),
            numBodies = bodies.length;
        for(var k=0; k!==numBodies; k++){
            var b=bodies[k],
                vlambda=b.vlambda
            a[i++] = vlambda[0];
            a[i++] = vlambda[1];
            a[i++] = b.wlambda;
        }
    }
};

/**
 * Applies the resulting constraint velocities on the bodies in the island.
 * @method
 * @memberof IslandGroup
 * @param  {Float32Array} a
 */
IslandGroup.prototype.applyResult = function(a){
    // Add result to velocity
    var islands=this.islands,
        numIslands = islands.length,
        i=0;

    // Assumed is the order of the bodies
    for(var j=0; j!==numIslands; j++){
        var bodies = islands[j].getBodies(),
            numBodies = bodies.length;
        for(var k=0; k!==numBodies; k++){
            var b=bodies[k],
                v=b.velocity,
                vlambdax = a[i++],
                vlambday = a[i++],
                wlambda = a[i++];

            vec2.set(b.vlambda, vlambdax, vlambday);
            vec2.add( v, v, b.vlambda);
            b.wlambda = wlambda;
            b.angularVelocity += wlambda;
        }
    }
};
