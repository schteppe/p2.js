var vec2 =      p2.vec2
,   Spring =    p2.Spring
,   Body =      p2.Body
,   Circle =    p2.Circle
,   Compound =  p2.Compound
,   Plane =     p2.Plane
,   Rectangle=  p2.Rectangle
,   Particle =  p2.Particle
,   Line =      p2.Line
,   EventDispatcher = p2.EventDispatcher

// shim layer with setTimeout fallback
var requestAnimationFrame =     window.requestAnimationFrame       ||
                                window.webkitRequestAnimationFrame ||
                                window.mozRequestAnimationFrame    ||
                                window.oRequestAnimationFrame      ||
                                window.msRequestAnimationFrame     ||
                                function( callback ){
                                    window.setTimeout(callback, 1000 / 60);
                                };


/**
 * Base class for rendering of a scene.
 * @class Demo
 * @constructor
 * @param {World} world
 */
function Demo(world){
    var that = this;

    this.world = world;
    this.initialState = world.toJSON();

    this.bodies=[];
    this.springs=[];
    this.paused = false;
    this.timeStep = 1/60;

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
            switch(e.keyCode){
                case 112: // p - pause
                    that.paused = !that.paused;
                    break;
                case 115: // s - step
                    that.world.step(that.world.lastTimeStep);
                    break;
                case 114: // r - restart
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
    this.stats_contactsdiv.innerHTML = "Contacts: "+this.world.contacts.length;
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
