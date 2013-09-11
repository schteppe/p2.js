var vec2 =      p2.vec2
,   Spring =    p2.Spring
,   Body =      p2.Body
,   Circle =    p2.Circle
,   Plane =     p2.Plane
,   Particle =  p2.Particle
,   Line =      p2.Line
,   EventDispatcher = p2.EventDispatcher

/**
 * Extend object a with properties in body b
 * @param  {Object} a
 * @param  {Object} b
 */
function extend(a,b){
    for(var key in b)
        a[key] = b[key];
}


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
        if(obj.shape){ // Only draw things that can be seen
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

/**
 * Demo using Pixi.js as renderer
 * @class PixiDemo
 * @constructor
 * @extends Demo
 */
function PixiDemo(world,options){
    options = options || {};

    var settings = {
        lineWidth : 2,
        scrollFactor : 0.1,
        pixelsPerLengthUnit : 128,
    };
    extend(settings,options);

    this.pixelsPerLengthUnit =  settings.pixelsPerLengthUnit;
    this.lineWidth =            settings.lineWidth;
    this.scrollFactor =         settings.scrollFactor;

    this.sprites = [],
    this.springSprites = [];

    Demo.call(this,world);

    var that = this;

    var lastX, lastY, startX, startY, down=false;
    /*
    $(document).mousedown(function(e){
        var stage = that.stage;
        lastX = e.clientX;
        lastY = e.clientY;
        startX = stage.position.x;
        startY = stage.position.y;
        down = true;
    }).mousemove(function(e){
        if(down){
            that.stage.position.x = e.clientX-lastX+startX;
            that.stage.position.y = e.clientY-lastY+startY;
        }
    }).mouseup(function(e){
        down = false;
    });
    */
/*
    $(window).bind('mousewheel', function(e){
        var scrollFactor = that.scrollFactor,
            stage = that.stage;
        if (e.originalEvent.wheelDelta >= 0){
            // Zoom in
            stage.scale.x *= (1+scrollFactor);
            stage.scale.y *= (1+scrollFactor);
            stage.position.x += (scrollFactor) * (stage.position.x - e.clientX);
            stage.position.y += (scrollFactor) * (stage.position.y - e.clientY);
        } else {
            // Zoom out
            stage.scale.x *= (1-scrollFactor);
            stage.scale.y *= (1-scrollFactor);
            stage.position.x -= (scrollFactor) * (stage.position.x - e.clientX);
            stage.position.y -= (scrollFactor) * (stage.position.y - e.clientY);
        }
        stage.updateTransform();
    });*/
};
PixiDemo.prototype = new Object(Demo.prototype);

/**
 * Draw a circle onto a graphics object
 * @method drawCircle
 * @static
 * @param  {PIXI.Graphics} g
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} radius
 * @param  {Number} color
 * @param  {Number} lineWidth
 */
PixiDemo.drawCircle = function(g,x,y,radius,color,lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)!="undefined" ? color : 0xffffff;
    g.lineStyle(lineWidth, 0x000000, 1);
    g.beginFill(color, 1.0);
    g.drawCircle(0, 0, radius);
    g.endFill();

    // line from center to edge
    g.moveTo(x,y);
    g.lineTo(x+radius,y);
};

PixiDemo.drawSpring = function(g,restLength,color,lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0xffffff : color;
    g.lineStyle(lineWidth, color, 1);
    var M = 12;
    var dx = restLength/M;
    g.moveTo(-restLength/2,0);
    for(var i=1; i<M; i++){
        var x = -restLength/2 + dx*i;
        var y = 0;
        if(i<=1 || i>=M-1 ){
            // Do nothing
        } else if(i % 2 === 0){
            y -= 0.1*restLength;
        } else {
            y += 0.1*restLength;
        }
        g.lineTo(x,y);
    }
    g.lineTo(restLength/2,0);
};


PixiDemo.drawPlane = function(g, x0, x1, color, lineWidth, diagMargin, diagSize){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0xffffff : color;
    g.lineStyle(lineWidth, color, 1);

    // Draw the actual plane
    g.moveTo(x0,0);
    g.lineTo(x1,0);

    // Draw diagonal lines
    for(var i=0; x0 + i*diagMargin < x1; i++){
        g.moveTo(x0 + i*diagMargin,            0);
        g.lineTo(x0 + i*diagMargin +diagSize,  +diagSize);
    }
};


PixiDemo.drawLine = function(g, len, color, lineWidth){
    lineWidth = lineWidth || 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);

    // Draw the actual plane
    g.moveTo(-len/2,0);
    g.lineTo( len/2,0);
};


var X = vec2.fromValues(1,0);
var distVec = vec2.fromValues(0,0);
PixiDemo.prototype.render = function(){
    var w = this.w,
        h = this.h,
        pixelsPerLengthUnit = this.pixelsPerLengthUnit,
        springSprites = this.springSprites,
        sprites = this.sprites;

    // Update body transforms
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i],
            s = this.sprites[i];
        s.position.x = w - b.position[0] * pixelsPerLengthUnit;
        s.position.y = h - b.position[1] * pixelsPerLengthUnit;
        s.rotation = b.angle;
    }

    // Update spring transforms
    for(var i=0; i<this.springs.length; i++){
        var s = this.springs[i],
            sprite = springSprites[i],
            bA = s.bodyA,
            bB = s.bodyB;
        sprite.scale.y = 1;
        if(bA.position[1] < bB.position[1]){
            var tmp = bA;
            bA = bB;
            bB = tmp;
            sprite.scale.y = -1;
        }
        sprite.position.x = ( ( w - bA.position[0] * pixelsPerLengthUnit ) + ( w - bB.position[0] * pixelsPerLengthUnit ) ) / 2;
        sprite.position.y = ( ( h - bA.position[1] * pixelsPerLengthUnit ) + ( h - bB.position[1] * pixelsPerLengthUnit ) ) / 2;
        distVec[0] = ( w - bA.position[0] * pixelsPerLengthUnit ) - ( w - bB.position[0] * pixelsPerLengthUnit );
        distVec[1] = ( h - bA.position[1] * pixelsPerLengthUnit ) - ( h - bB.position[1] * pixelsPerLengthUnit );
        sprite.rotation = -Math.acos( vec2.dot(X, distVec) / vec2.length(distVec) );
        sprite.scale.x = vec2.length(distVec) / (s.restLength * pixelsPerLengthUnit);
    }

    this.renderer.render(this.container);
}

PixiDemo.prototype.init = function(){
    var w = this.w,
        h = this.h;

    var that = this;

    var renderer = this.renderer = PIXI.autoDetectRenderer(1280, 720);
    var stage = this.stage = new PIXI.DisplayObjectContainer();
    var container = this.container = new PIXI.Stage(0xFFFFFF,true);
    document.body.appendChild(this.renderer.view);

    this.container.addChild(stage);
    stage.position.x = -renderer.width/2*0; // center at origin
    stage.position.y = -renderer.height/2*0;

    var lastX, lastY, lastMoveX, lastMoveY, startX, startY, down=false;

    container.mousedown = function(e){
        lastX = e.global.x;
        lastY = e.global.y;
        startX = stage.position.x;
        startY = stage.position.y;
        down = true;
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;
    };
    container.mousemove = function(e){
        if(down){
            stage.position.x = e.global.x-lastX+startX;
            stage.position.y = e.global.y-lastY+startY;
        }
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;
    };
    container.mouseup = function(e){
        down = false;
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;
    };

    $(window).bind('mousewheel', function(e){
        var scrollFactor = that.scrollFactor,
            stage = that.stage;
        if (e.originalEvent.wheelDelta >= 0){
            // Zoom in
            stage.scale.x *= (1+scrollFactor);
            stage.scale.y *= (1+scrollFactor);
            stage.position.x += (scrollFactor) * (stage.position.x - lastMoveX);
            stage.position.y += (scrollFactor) * (stage.position.y - lastMoveY);
        } else {
            // Zoom out
            stage.scale.x *= (1-scrollFactor);
            stage.scale.y *= (1-scrollFactor);
            stage.position.x -= (scrollFactor) * (stage.position.x - lastMoveX);
            stage.position.y -= (scrollFactor) * (stage.position.y - lastMoveY);
        }
        stage.updateTransform();
    });
}

PixiDemo.prototype.addRenderable = function(obj){
    var ppu = this.pixelsPerLengthUnit;

    if(obj instanceof Body && obj.shape){

        if(obj.shape instanceof Circle){
            var sprite = new PIXI.Graphics();
            var radiusPixels = obj.shape.radius * ppu;
            PixiDemo.drawCircle(sprite,0,0,radiusPixels,0xFFFFFF,this.lineWidth);
            this.sprites.push(sprite);
            this.stage.addChild(sprite);

        } else if(obj.shape instanceof Particle){
            var sprite = new PIXI.Graphics();
            var radiusPixels = obj.shape.radius * ppu;
            // Make a circle with radius=2*lineWidth
            PixiDemo.drawCircle(sprite,0,0,2*this.lineWidth,0x000000,0);
            this.sprites.push(sprite);
            this.stage.addChild(sprite);

        } else if(obj.shape instanceof Plane){
            // TODO draw something.. How big should this plane be?
            var sprite = new PIXI.Graphics();
            PixiDemo.drawPlane(sprite, -10*ppu, 10*ppu, 0x000000, this.lineWidth, this.lineWidth*10, this.lineWidth*10);
            this.sprites.push(sprite);
            this.stage.addChild(sprite);

        } else if(obj.shape instanceof Line){
            var sprite = new PIXI.Graphics();
            PixiDemo.drawLine(sprite, obj.shape.length*ppu, 0x000000, this.lineWidth);
            this.sprites.push(sprite);
            this.stage.addChild(sprite);

        } else {
            console.warn("Shape could not be rendered:",obj.shape);
        }
    } else if(obj instanceof Spring){
        var sprite = new PIXI.Graphics();
        var restLengthPixels = obj.restLength * ppu;
        PixiDemo.drawSpring(sprite,restLengthPixels,0x000000,this.lineWidth);
        this.springSprites.push(sprite);
        this.stage.addChild(sprite);
    }
};

PixiDemo.prototype.removeRenderable = function(obj){
    if(obj instanceof Body){
        var i = this.bodies.indexOf(obj);
        if(i!=-1){
            this.stage.removeChild(this.sprites[i]);
            this.sprites.splice(i,1);
        }
    } else if(obj instanceof Spring){
        var i = this.springs.indexOf(obj);
        if(i!=-1){
            this.stage.removeChild(this.springSprites[i]);
            this.springSprites.splice(i,1);
        }
    }
};

PixiDemo.prototype.resize = function(w,h){
    var renderer = this.renderer;
    var view = renderer.view;
    view.style.position = "absolute";

    var ratio = w / h;
    var pixiRatio = renderer.width / renderer.height;

    if(ratio > pixiRatio){ // Screen is wider than our renderer
        view.style.height = h + "px";
        view.style.width =  (h * pixiRatio) +"px";
        view.style.left = ( (w - h * pixiRatio) / 2 ) +"px";
    } else { // Screen is narrower
        view.style.height =  (w / pixiRatio) +"px";
        view.style.width = w + "px";
        view.style.top = ( (h - w / pixiRatio) / 2 ) +"px";
    }
};
