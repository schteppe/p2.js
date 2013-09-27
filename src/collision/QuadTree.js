module.exports = {
    QuadTree : QuadTree,
    Node : Node,
    BoundsNode : BoundsNode,
};

/**
 * QuadTree data structure. See https://github.com/mikechambers/ExamplesByMesh/tree/master/JavaScript/QuadTree
 * @class QuadTree
 * @constructor
 * @param {Object} An object representing the bounds of the top level of the QuadTree. The object
 * should contain the following properties : x, y, width, height
 * @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds
 * (width / height)(false). Default value is false.
 * @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.
 * @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
 */
function QuadTree(bounds, pointQuad, maxDepth, maxChildren){
    var node;
    if(pointQuad){
        node = new Node(bounds, 0, maxDepth, maxChildren);
    } else {
        node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
    }

    /**
     * The root node of the QuadTree which covers the entire area being segmented.
     * @property root
     * @type Node
     */
    this.root = node;
}

/**
 * Inserts an item into the QuadTree.
 * @method insert
 * @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y
 * properties that represents its position in 2D space.
 */
QuadTree.prototype.insert = function(item){
    if(item instanceof Array){
        var len = item.length;
        for(var i = 0; i < len; i++){
            this.root.insert(item[i]);
        }
    } else {
        this.root.insert(item);
    }
}

/**
 * Clears all nodes and children from the QuadTree
 * @method clear
 */
QuadTree.prototype.clear = function(){
    this.root.clear();
}

/**
 * Retrieves all items / points in the same node as the specified item / point. If the specified item
 * overlaps the bounds of a node, then all children in both nodes will be returned.
 * @method retrieve
 * @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
 * with dimensions (x, y, width, height) properties.
 */
QuadTree.prototype.retrieve = function(item){
    //get a copy of the array of items
    var out = this.root.retrieve(item).slice(0);
    return out;
}

function Node(bounds, depth, maxDepth, maxChildren){
    this.bounds = bounds;
    this.children = [];
    this.nodes = [];

    if(maxChildren){
        this.maxChildren = maxChildren;
    }

    if(maxDepth){
        this.maxDepth = maxDepth;
    }

    if(depth){
        this.depth = depth;
    }
}

//subnodes
Node.prototype.classConstructor = Node;

//children contained directly in the node
Node.prototype.children = null;

//read only
Node.prototype.depth = 0;

Node.prototype.maxChildren = 4;
Node.prototype.maxDepth = 4;

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;

Node.prototype.insert = function(item){
    if(this.nodes.length){
        var index = this.findIndex(item);
        this.nodes[index].insert(item);
        return;
    }

    this.children.push(item);

    var len = this.children.length;
    if(!(this.depth >= this.maxDepth) && len > this.maxChildren) {
        this.subdivide();

        for(var i = 0; i < len; i++){
            this.insert(this.children[i]);
        }

        this.children.length = 0;
    }
}

Node.prototype.retrieve = function(item){
    if(this.nodes.length){
        var index = this.findIndex(item);
        return this.nodes[index].retrieve(item);
    }

    return this.children;
}

Node.prototype.findIndex = function(item){
    var b = this.bounds;
    var left = (item.x > b.x + b.width / 2)? false : true;
    var top = (item.y > b.y + b.height / 2)? false : true;

    //top left
    var index = Node.TOP_LEFT;
    if(left){
        if(!top){
            index = Node.BOTTOM_LEFT;
        }
    } else {
        if(top){
            index = Node.TOP_RIGHT;
        } else {
            index = Node.BOTTOM_RIGHT;
        }
    }

    return index;
}


Node.prototype.subdivide = function(){
    var depth = this.depth + 1;

    var bx = this.bounds.x;
    var by = this.bounds.y;

    //floor the values
    var b_w_h = (this.bounds.width / 2)|0;
    var b_h_h = (this.bounds.height / 2)|0;
    var bx_b_w_h = bx + b_w_h;
    var by_b_h_h = by + b_h_h;

    //top left
    this.nodes[Node.TOP_LEFT] = new this.classConstructor({
        x:bx,
        y:by,
        width:b_w_h,
        height:b_h_h
    },
    depth);

    //top right
    this.nodes[Node.TOP_RIGHT] = new this.classConstructor({
        x:bx_b_w_h,
        y:by,
        width:b_w_h,
        height:b_h_h
    },
    depth);

    //bottom left
    this.nodes[Node.BOTTOM_LEFT] = new this.classConstructor({
        x:bx,
        y:by_b_h_h,
        width:b_w_h,
        height:b_h_h
    },
    depth);


    //bottom right
    this.nodes[Node.BOTTOM_RIGHT] = new this.classConstructor({
        x:bx_b_w_h,
        y:by_b_h_h,
        width:b_w_h,
        height:b_h_h
    },
    depth);
}

Node.prototype.clear = function(){
    this.children.length = 0;

    var len = this.nodes.length;
    for(var i = 0; i < len; i++){
        this.nodes[i].clear();
    }

    this.nodes.length = 0;
}


/******************** BoundsQuadTree ****************/

function BoundsNode(bounds, depth, maxChildren, maxDepth){
    Node.call(this, bounds, depth, maxChildren, maxDepth);
    this.stuckChildren = [];
}

BoundsNode.prototype = new Node();
BoundsNode.prototype.classConstructor = BoundsNode;
BoundsNode.prototype.stuckChildren = null;

//we use this to collect and conctenate items being retrieved. This way
//we dont have to continuously create new Array instances.
//Note, when returned from QuadTree.retrieve, we then copy the array
BoundsNode.prototype.out = [];

BoundsNode.prototype.insert = function(item){
    if(this.nodes.length)
    {
        var index = this.findIndex(item);
        var node = this.nodes[index];

        //todo: make _bounds bounds
        if(item.x >= node.bounds.x &&
            item.x + item.width <= node.bounds.x + node.bounds.width &&
            item.y >= node.bounds.y &&
            item.y + item.height <= node.bounds.y + node.bounds.height){
            this.nodes[index].insert(item);
        } else {
            this.stuckChildren.push(item);
        }

        return;
    }

    this.children.push(item);

    var len = this.children.length;

    if(!(this.depth >= this.maxDepth) &&
        len > this.maxChildren){
        this.subdivide();

        for(var i = 0; i < len; i++){
            this.insert(this.children[i]);
        }

        this.children.length = 0;
    }
}

BoundsNode.prototype.getChildren = function(){
    return this.children.concat(this.stuckChildren);
}

BoundsNode.prototype.retrieve = function(item){
    var out = this.out;
    out.length = 0;
    if(this.nodes.length)
    {
        var index = this.findIndex(item);

        out.push.apply(out, this.nodes[index].retrieve(item));
    }

    out.push.apply(out, this.stuckChildren);
    out.push.apply(out, this.children);

    return out;
}

BoundsNode.prototype.clear = function(){

    this.stuckChildren.length = 0;

    //array
    this.children.length = 0;

    var len = this.nodes.length;

    if(!len){
        return;
    }

    for(var i = 0; i < len; i++){
        this.nodes[i].clear();
    }

    //array
    this.nodes.length = 0;

    //we could call the super clear function but for now, im just going to inline it
    //call the hidden super.clear, and make sure its called with this = this instance
    //Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);
}

