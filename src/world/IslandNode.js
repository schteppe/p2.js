module.exports = IslandNode;

/**
 * Holds a body and keeps track of some additional properties needed for graph traversal.
 * @class IslandNode
 * @constructor
 * @param {Body} body
 */
function IslandNode(body){

	/**
	 * The body that is contained in this node.
	 * @property {Body}
	 */
    this.body = body;

    /**
     * Neighboring IslandNodes
     * @property {Array} neighbors
     */
    this.neighbors = [];

    /**
     * Equations connected to this node.
     * @property {Array} equations
     */
    this.equations = [];

    /**
     * If this node was visiting during the graph traversal.
     * @property visited
     * @type {Boolean}
     */
    this.visited = false;
}

/**
 * Clean this node from bodies and equations.
 * @method reset
 */
IslandNode.prototype.reset = function(){
    this.equations.length = 0;
    this.neighbors.length = 0;
    this.visited = false;
    this.body = null;
};
