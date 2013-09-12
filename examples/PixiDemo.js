/**
 * Demo using Pixi.js as renderer
 * @class PixiDemo
 * @constructor
 * @extends Demo
 * @param {World}   world                       The world to render.
 * @param {Object}  [options]
 * @param {Number}  options.lineWidth
 * @param {Number}  options.scrollFactor
 * @param {Number}  options.pixelsPerLengthUnit
 * @param {Number}  options.width               Num pixels in horizontal direction
 * @param {Number}  options.height              Num pixels in vertical direction
 */
function PixiDemo(world,options){
    options = options || {};

    var settings = {
        lineWidth : 2,
        scrollFactor : 0.1,
        pixelsPerLengthUnit : 128,
        width : 1280, // Pixi screen resolution
        height : 720,
    };
    for(var key in options)
        settings[key] = options[key];

    this.settings = settings;
    this.pixelsPerLengthUnit =  settings.pixelsPerLengthUnit;
    this.lineWidth =            settings.lineWidth;
    this.scrollFactor =         settings.scrollFactor;

    this.sprites = [],
    this.springSprites = [];

    Demo.call(this,world);
};
PixiDemo.prototype = Object.create(Demo.prototype);

/**
 * Initialize the renderer and stage
 */
PixiDemo.prototype.init = function(){
    var w = this.w,
        h = this.h,
        s = this.settings;

    var that = this;

    var renderer =  this.renderer =     PIXI.autoDetectRenderer(s.width, s.height);
    var stage =     this.stage =        new PIXI.DisplayObjectContainer();
    var container = this.container =    new PIXI.Stage(0xFFFFFF,true);
    document.body.appendChild(this.renderer.view);

    this.container.addChild(stage);

    stage.position.x = -renderer.width/2; // center at origin
    stage.position.y = -renderer.height/2;

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
};

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
    var w = this.renderer.width,
        h = this.renderer.height,
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
