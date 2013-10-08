var vec2 =      p2.vec2
,   Spring =    p2.Spring
,   Body =      p2.Body
,   Circle =    p2.Circle
,   Capsule =   p2.Capsule
,   Convex =    p2.Convex
,   Compound =  p2.Compound
,   Plane =     p2.Plane
,   Rectangle=  p2.Rectangle
,   Particle =  p2.Particle
,   Line =      p2.Line
,   EventEmitter = p2.EventEmitter
,   PointToPointConstraint = p2.PointToPointConstraint

// shim layer with setTimeout fallback
var requestAnimationFrame =     window.requestAnimationFrame       ||
                                window.webkitRequestAnimationFrame ||
                                window.mozRequestAnimationFrame    ||
                                window.oRequestAnimationFrame      ||
                                window.msRequestAnimationFrame     ||
                                function( callback ){
                                    window.setTimeout(callback, 1000 / 60);
                                };

function DemoStates(){};
DemoStates.DEFAULT =  1;
DemoStates.PANNING =  2;
DemoStates.DRAGGING = 3;

/**
 * Base class for rendering of a scene.
 * @class Demo
 * @constructor
 * @param {World} world
 */
function Demo(world){
    EventEmitter.call(this);

    var that = this;

    this.world = world;
    this.initialState = world.toJSON();

    this.state = DemoStates.DEFAULT;

    this.bodies=[];
    this.springs=[];
    this.paused = false;
    this.timeStep = 1/60;

    this.mouseConstraint = null;
    this.nullBody = new Body();
    this.pickPrecision = 5;

    this.stats_sum = 0;
    this.stats_N = 100;
    this.stats_Nsummed = 0;
    this.stats_average = -1;

    this.w = $(window).width();
    this.h = $(window).height();

    this.init();
    this.resize(this.w,this.h);
    this.render();
    this.createStats();

    world.on("postStep",function(e){
        that.render();
        that.updateStats();
    }).on("addBody",function(e){
        that.addVisual(e.body);
    }).on("removeBody",function(e){
        that.removeVisual(e.body);
    }).on("addSpring",function(e){
        that.addVisual(e.spring);
    }).on("removeSpring",function(e){
        that.removeVisual(e.spring);
    });

    $(window).resize(function(){
        that.resize($(window).width(), $(window).height());
    });

    document.addEventListener('keypress',function(e){
        if(e.keyCode){
            switch(String.fromCharCode(e.keyCode)){
                case "p": // pause
                    that.paused = !that.paused;
                    break;
                case "s": // step
                    that.world.step(that.world.lastTimeStep);
                    break;
                case "r": // restart
                    that.removeAllVisuals();
                    that.world.fromJSON(that.initialState);
                    break;
            }
        }
    });

    // Add initial bodies
    for(var i=0; i<world.bodies.length; i++)
        this.addVisual(world.bodies[i]);
    for(var i=0; i<world.springs.length; i++)
        this.addVisual(world.springs[i]);
}
Demo.prototype = new EventEmitter();

/**
 * Should be called by subclasses whenever there's a mousedown event
 */
Demo.prototype.handleMouseDown = function(physicsPosition){
    switch(this.state){
        case DemoStates.DEFAULT:
            var result = this.world.hitTest(physicsPosition,world.bodies,this.pickPrecision);
            if(result.length > 0){
                var b = result[0]; // The grabbed body
                this.state = DemoStates.DRAGGING;
                // Add mouse joint to the body
                var localPoint = vec2.create();
                b.toLocalFrame(localPoint,physicsPosition);
                this.world.addBody(this.nullBody);
                this.mouseConstraint = new PointToPointConstraint(  this.nullBody, physicsPosition,
                                                                    b,             localPoint);
                this.world.addConstraint(this.mouseConstraint);
            } else {
                this.state = DemoStates.PANNING;
            }
            break;
    }
};

/**
 * Should be called by subclasses whenever there's a mousedown event
 */
Demo.prototype.handleMouseMove = function(physicsPosition){
};

/**
 * Should be called by subclasses whenever there's a mouseup event
 */
Demo.prototype.handleMouseUp = function(physicsPosition){
    switch(this.state){
        case DemoStates.DEFAULT:
            break;
        case DemoStates.DRAGGING:
            // Drop constraint
            this.world.removeConstraint(this.mouseConstraint);
            this.mouseConstraint = null;
            this.world.removeBody(this.nullBody);
        case DemoStates.PANNING:
            this.state = DemoStates.DEFAULT;
            break;
    }
};

/**
 * Update stats
 */
Demo.prototype.updateStats = function(){
    this.stats_sum += this.world.lastStepTime;
    this.stats_Nsummed++;
    if(this.stats_Nsummed == this.stats_N){
        this.stats_average = this.stats_sum/this.stats_N;
        this.stats_sum = 0.0;
        this.stats_Nsummed = 0;
    }
    this.stats_stepdiv.innerHTML = "Physics step: "+(Math.round(this.stats_average*100)/100)+"ms";
    this.stats_contactsdiv.innerHTML = "Contacts: "+this.world.nearphase.contactEquations.length;
};

/**
 * Add an object to the demo
 * @param  {mixed} obj Either Body or Spring
 */
Demo.prototype.addVisual = function(obj){
    if(obj instanceof Spring){
        this.springs.push(obj);
        this.addRenderable(obj);
    } else if(obj instanceof Body){
        if(obj.shapes.length){ // Only draw things that can be seen
            this.bodies.push(obj);
            this.addRenderable(obj);
        }
    } else
        throw new Error("Visual type not recognized.");
};

/**
 * Removes all visuals from the scene
 */
Demo.prototype.removeAllVisuals = function(){
    var bodies = this.bodies,
        springs = this.springs;
    while(bodies.length)
        this.removeVisual(bodies[bodies.length-1]);
    while(springs.length)
        this.removeVisual(springs[springs.length-1]);
};

/**
 * Remove an object from the demo
 * @param  {mixed} obj Either Body or Spring
 */
Demo.prototype.removeVisual = function(obj){
    this.removeRenderable(obj);
    if(obj instanceof Spring){
        var idx = this.springs.indexOf(obj);
        if(idx != -1)
            this.springs.splice(idx,1);
    } else if(obj instanceof Body){
        var idx = this.bodies.indexOf(obj);
        if(idx != -1)
            this.bodies.splice(idx,1);
    } else {
        console.error("Visual type not recognized...");
    }
};

/**
 * Create the container/divs for stats
 */
Demo.prototype.createStats = function(){
    var stepDiv = document.createElement("div");
    var vecsDiv = document.createElement("div");
    var matsDiv = document.createElement("div");
    var contactsDiv = document.createElement("div");
    stepDiv.setAttribute("id","step");
    vecsDiv.setAttribute("id","vecs");
    matsDiv.setAttribute("id","mats");
    contactsDiv.setAttribute("id","contacts");
    document.body.appendChild(stepDiv);
    document.body.appendChild(vecsDiv);
    document.body.appendChild(matsDiv);
    document.body.appendChild(contactsDiv);
    this.stats_stepdiv = stepDiv;
    this.stats_contactsdiv = contactsDiv;
};
