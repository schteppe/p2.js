import vec2 from '../math/vec2';
import Island from './Island';
import IslandNode from './IslandNode';
import Body from '../objects/Body';

export default IslandManager;

/**
 * Splits the system of bodies and equations into independent islands
 *
 * @class IslandManager
 * @constructor
 * @param {Object} [options]
 * @extends Solver
 */
function IslandManager(options){

    // Pooling of node objects saves some GC load
    this._nodePool = [];
    this._islandPool = [];

    /**
     * The equations to split. Manually fill this array before running .split().
     * @property {Array} equations
     */
    this.equations = [];

    /**
     * The resulting {{#crossLink "Island"}}{{/crossLink}}s.
     * @property {Array} islands
     */
    this.islands = [];

    /**
     * The resulting graph nodes.
     * @property {Array} nodes
     */
    this.nodes = [];

    /**
     * The node queue, used when traversing the graph of nodes.
     * @private
     * @property {Array} queue
     */
    this.queue = [];
}

/**
 * Get an unvisited node from a list of nodes.
 * @static
 * @method getUnvisitedNode
 * @param  {Array} nodes
 * @return {IslandNode|boolean} The node if found, else false.
 */
IslandManager.getUnvisitedNode = function(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && node.body.type === Body.DYNAMIC){
            return node;
        }
    }
    return false;
};

/**
 * Visit a node.
 * @method visit
 * @param  {IslandNode} node
 * @param  {Array} bds
 * @param  {Array} eqs
 */
IslandManager.prototype.visit = function (node,bds,eqs){
    bds.push(node.body);
    var Neqs = node.equations.length;
    for(var i=0; i!==Neqs; i++){
        var eq = node.equations[i];
        if(eqs.indexOf(eq) === -1){ // Already added?
            eqs.push(eq);
        }
    }
};

/**
 * Runs the search algorithm, starting at a root node. The resulting bodies and equations will be stored in the provided arrays.
 * @method bfs
 * @param  {IslandNode} root The node to start from
 * @param  {Array} bds  An array to append resulting Bodies to.
 * @param  {Array} eqs  An array to append resulting Equations to.
 */
IslandManager.prototype.bfs = function(root,bds,eqs){

    // Reset the visit queue
    var queue = this.queue;
    queue.length = 0;

    // Add root node to queue
    queue.push(root);
    root.visited = true;
    this.visit(root,bds,eqs);

    // Process all queued nodes
    while(queue.length) {

        // Get next node in the queue
        var node = queue.pop();

        // Visit unvisited neighboring nodes
        var child;
        while((child = IslandManager.getUnvisitedNode(node.neighbors))) {
            child.visited = true;
            this.visit(child,bds,eqs);

            // Only visit the children of this node if it's dynamic
            if(child.body.type === Body.DYNAMIC){
                queue.push(child);
            }
        }
    }
};

/**
 * Split the world into independent islands. The result is stored in .islands.
 * @method split
 * @param  {World} world
 * @return {Array} The generated islands
 */
IslandManager.prototype.split = function(world){
    var bodies = world.bodies,
        nodes = this.nodes,
        equations = this.equations;

    // Move old nodes to the node pool
    while(nodes.length){
        this._nodePool.push(nodes.pop());
    }

    // Create needed nodes, reuse if possible
    for(var i=0; i!==bodies.length; i++){
        if(this._nodePool.length){
            var node = this._nodePool.pop();
            node.reset();
            node.body = bodies[i];
            nodes.push(node);
        } else {
            nodes.push(new IslandNode(bodies[i]));
        }
    }

    // Add connectivity data. Each equation connects 2 bodies.
    for(var k=0; k!==equations.length; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bodyA),
            j=bodies.indexOf(eq.bodyB),
            ni=nodes[i],
            nj=nodes[j];
        ni.neighbors.push(nj);
        nj.neighbors.push(ni);
        ni.equations.push(eq);
        nj.equations.push(eq);
    }

    // Move old islands to the island pool
    var islands = this.islands;
    while(islands.length){
        var island = islands.pop();
        island.reset();
        this._islandPool.push(island);
    }

    // Get islands
    var child;
    while((child = IslandManager.getUnvisitedNode(nodes))){

        // Create new island
        var island = this._islandPool.length ? this._islandPool.pop() : new Island();

        // Get all equations and bodies in this island
        this.bfs(child, island.bodies, island.equations);

        islands.push(island);
    }

    return islands;
};
