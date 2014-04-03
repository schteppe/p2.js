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

    var that = this;

    var settings = {
        lineWidth : 1,
        scrollFactor : 0.1,
        pixelsPerLengthUnit : 128,
        width : 1280, // Pixi screen resolution
        height : 720,
        useDeviceAspect : false,
        sleepOpacity : 0.2,
    };
    for(var key in options)
        settings[key] = options[key];

    if(settings.useDeviceAspect)
        settings.height = $(window).height() / $(window).width() * settings.width;

    this.settings = settings;
    var ppu = this.pixelsPerLengthUnit =  settings.pixelsPerLengthUnit;
    this.lineWidth =            settings.lineWidth;
    this.scrollFactor =         settings.scrollFactor;
    this.sleepOpacity =         settings.sleepOpacity;

    this.sprites = [];
    this.springSprites = [];
    this.debugPolygons = false;

    Demo.call(this,world);

    this.pickPrecision = 20 / settings.pixelsPerLengthUnit;

    // Update "ghost draw line"
    this.on("drawPointsChange",function(e){
        var g = that.drawShapeGraphics;
        var path = that.drawPoints;

        g.clear();

        var path2 = [];
        for(var j=0; j<path.length; j++){
            var v = path[j];
            path2.push([v[0]*ppu, that.settings.height -v[1]*ppu]);
        }

        that.drawPath(g,path2,0xff0000,false,1,false);
    });

    // Update draw circle
    this.on("drawCircleChange",function(e){
        var g = that.drawShapeGraphics;
        g.clear();
        var center = that.drawCircleCenter;
        var R = p2.vec2.dist(center, that.drawCirclePoint);
        var h = that.renderer.height;
        that.drawCircle(g,center[0]*ppu,h-ppu*center[1],0,ppu*R,false,that.lineWidth);
    });
};
PixiDemo.prototype = Object.create(Demo.prototype);

PixiDemo.prototype.stagePositionToPhysics = function(out,stagePosition){
    var x = stagePosition[0]/this.pixelsPerLengthUnit,
        y = (this.renderer.height - stagePosition[1])/this.pixelsPerLengthUnit;
    p2.vec2.set(out, x, y);
    return out;
};

/**
 * Initialize the renderer and stage
 */
var init_stagePosition = p2.vec2.create(),
    init_physicsPosition = p2.vec2.create();
PixiDemo.prototype.init = function(){
    var w = this.w,
        h = this.h,
        s = this.settings;

    var that = this;

    var renderer =  this.renderer =     PIXI.autoDetectRenderer(s.width, s.height);
    var stage =     this.stage =        new PIXI.DisplayObjectContainer();
    var container = this.container =    new PIXI.Stage(0xFFFFFF,true);
    document.body.appendChild(this.renderer.view);

    this.element = this.renderer.view;

    $(this.renderer.view).on("contextmenu",function(e){
        return false;
    });

    this.container.addChild(stage);

    // Graphics object for drawing shapes
    this.drawShapeGraphics = new PIXI.Graphics();
    stage.addChild(this.drawShapeGraphics);

    // Graphics object for contacts
    this.contactGraphics = new PIXI.Graphics();
    stage.addChild(this.contactGraphics);

    stage.position.x = renderer.width/2; // center at origin
    stage.position.y = -renderer.height/2;

    var lastX, lastY, lastMoveX, lastMoveY, startX, startY, down=false;

    container.mousedown = container.touchstart = function(e){
        lastX = e.global.x;
        lastY = e.global.y;
        startX = stage.position.x;
        startY = stage.position.y;
        down = true;
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;

        that.lastMousePos = e.global;

        var pos = e.getLocalPosition(stage);
        p2.vec2.set(init_stagePosition, pos.x, pos.y);
        that.stagePositionToPhysics(init_physicsPosition, init_stagePosition);
        that.handleMouseDown(init_physicsPosition);
    };
    container.mousemove = container.touchmove = function(e){
        if(down && that.state == Demo.PANNING){
            stage.position.x = e.global.x-lastX+startX;
            stage.position.y = e.global.y-lastY+startY;
        }
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;

        that.lastMousePos = e.global;

        var pos = e.getLocalPosition(stage);
        p2.vec2.set(init_stagePosition, pos.x, pos.y);
        that.stagePositionToPhysics(init_physicsPosition, init_stagePosition);
        that.handleMouseMove(init_physicsPosition);
    };
    container.mouseup = container.touchend = function(e){
        down = false;
        lastMoveX = e.global.x;
        lastMoveY = e.global.y;

        that.lastMousePos = e.global;

        var pos = e.getLocalPosition(stage);
        p2.vec2.set(init_stagePosition, pos.x, pos.y);
        that.stagePositionToPhysics(init_physicsPosition, init_stagePosition);
        that.handleMouseUp(init_physicsPosition);
    };

    // http://stackoverflow.com/questions/7691551/touchend-event-in-ios-webkit-not-firing
    $(document).bind("touchmove",function(e){
        e.preventDefault();
    })

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

    this.on('zoomin', function(e){
        var scrollFactor = that.scrollFactor,
            stage = that.stage;
        stage.scale.x *= (1+scrollFactor);
        stage.scale.y *= (1+scrollFactor);
        stage.position.x += (scrollFactor) * (stage.position.x);
        stage.position.y += (scrollFactor) * (stage.position.y);
        stage.updateTransform();
    }).on('zoomout', function(e){
        var scrollFactor = that.scrollFactor,
            stage = that.stage;
        stage.scale.x *= (1-scrollFactor);
        stage.scale.y *= (1-scrollFactor);
        stage.position.x -= (scrollFactor) * (stage.position.x);
        stage.position.y -= (scrollFactor) * (stage.position.y);
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
PixiDemo.prototype.drawCircle = function(g,x,y,angle,radius,color,lineWidth,isSleeping){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="number" ? color : 0xffffff;
    g.lineStyle(lineWidth, 0x000000, 1);
    g.beginFill(color, isSleeping ? this.sleepOpacity : 1.0);
    g.drawCircle(x, y, radius);
    g.endFill();

    // line from center to edge
    g.moveTo(x,y);
    g.lineTo(   x + radius*Math.cos(-angle),
                y + radius*Math.sin(-angle) );
};

PixiDemo.drawSpring = function(g,restLength,color,lineWidth){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0xffffff : color;
    g.lineStyle(lineWidth, color, 1);
    if(restLength < lineWidth*10){
        restLength = lineWidth*10;
    }
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

/**
 * Draw a finite plane onto a PIXI.Graphics.
 * @method drawPlane
 * @param  {Graphics} g
 * @param  {Number} x0
 * @param  {Number} x1
 * @param  {Number} color
 * @param  {Number} lineWidth
 * @param  {Number} diagMargin
 * @param  {Number} diagSize
 * @todo Should consider an angle
 */
PixiDemo.drawPlane = function(g, x0, x1, color, lineColor, lineWidth, diagMargin, diagSize, maxLength){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0xffffff : color;
    g.lineStyle(lineWidth, lineColor, 1);

    // Draw a fill color
    g.lineStyle(0,0,0);
    g.beginFill(color);
    var max = maxLength;
    g.moveTo(-max,0);
    g.lineTo(max,0);
    g.lineTo(max,max);
    g.lineTo(-max,max);
    g.endFill();

    // Draw the actual plane
    g.lineStyle(lineWidth,lineColor);
    g.moveTo(-max,0);
    g.lineTo(max,0);

    // Draw diagonal lines
    /*
    for(var i=0; x0 + i*diagMargin < x1; i++){
        g.moveTo(x0 + i*diagMargin,            0);
        g.lineTo(x0 + i*diagMargin +diagSize,  +diagSize);
    }
    */
};

PixiDemo.drawLine = function(g, len, color, lineWidth){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);

    // Draw the actual plane
    g.moveTo(-len/2,0);
    g.lineTo( len/2,0);
};

PixiDemo.prototype.drawCapsule = function(g, x, y, angle, len, radius, color, fillColor, lineWidth, isSleeping){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);

    // Draw circles at ends
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0);
    g.drawCircle(-len/2*c + x, -len/2*s + y, radius);
    g.drawCircle( len/2*c + x,  len/2*s + y, radius);
    g.endFill();

    // Draw rectangle
    g.lineStyle(lineWidth, color, 0);
    g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0);
    g.moveTo(-len/2*c + radius*s + x, -len/2*s + radius*c + y);
    g.lineTo( len/2*c + radius*s + x,  len/2*s + radius*c + y);
    g.lineTo( len/2*c - radius*s + x,  len/2*s - radius*c + y);
    g.lineTo(-len/2*c - radius*s + x, -len/2*s - radius*c + y);
    g.endFill();

    // Draw lines in between
    g.lineStyle(lineWidth, color, 1);
    g.moveTo(-len/2*c + radius*s + x, -len/2*s + radius*c + y);
    g.lineTo( len/2*c + radius*s + x,  len/2*s + radius*c + y);
    g.moveTo(-len/2*c - radius*s + x, -len/2*s - radius*c + y);
    g.lineTo( len/2*c - radius*s + x,  len/2*s - radius*c + y);

};

// Todo angle
PixiDemo.prototype.drawRectangle = function(g,x,y,angle,w,h,color,fillColor,lineWidth,isSleeping){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth);
    g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0);
    g.drawRect(x-w/2,y-h/2,w,h);
};

PixiDemo.prototype.drawConvex = function(g,verts,triangles,color,fillColor,lineWidth,debug,offset,isSleeping){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    if(!debug){
        g.lineStyle(lineWidth, color, 1);
        g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0);
        for(var i=0; i!==verts.length; i++){
            var v = verts[i],
                x = v[0],
                y = v[1];
            if(i==0)
                g.moveTo(x,y);
            else
                g.lineTo(x,y);
        }
        g.endFill();
        if(verts.length>2){
            g.moveTo(verts[verts.length-1][0],verts[verts.length-1][1]);
            g.lineTo(verts[0][0],verts[0][1]);
        }
    } else {
        var colors = [0xff0000,0x00ff00,0x0000ff];
        for(var i=0; i!==verts.length+1; i++){
            var v0 = verts[i%verts.length],
                v1 = verts[(i+1)%verts.length],
                x0 = v0[0],
                y0 = v0[1],
                x1 = v1[0],
                y1 = v1[1];
            g.lineStyle(lineWidth, colors[i%colors.length], 1);
            g.moveTo(x0,y0);
            g.lineTo(x1,y1);
            g.drawCircle(x0,y0,lineWidth*2);
        }

        g.lineStyle(lineWidth, 0x000000, 1);
        g.drawCircle(offset[0],offset[1],lineWidth*2);
    }
};

PixiDemo.prototype.drawPath = function(g,path,color,fillColor,lineWidth,isSleeping){
    lineWidth = typeof(lineWidth)=="number" ? lineWidth : 1;
    color = typeof(color)=="undefined" ? 0x000000 : color;
    g.lineStyle(lineWidth, color, 1);
    if(typeof(fillColor)=="number")
        g.beginFill(fillColor, isSleeping ? this.sleepOpacity : 1.0);
    var lastx = null,
        lasty = null;
    for(var i=0; i<path.length; i++){
        var v = path[i],
            x = v[0],
            y = v[1];
        if(x != lastx || y != lasty){
            if(i==0)
                g.moveTo(x,y);
            else {
                // Check if the lines are parallel
                var p1x = lastx,
                    p1y = lasty,
                    p2x = x,
                    p2y = y,
                    p3x = path[(i+1)%path.length][0],
                    p3y = path[(i+1)%path.length][1];
                var area = ((p2x - p1x)*(p3y - p1y))-((p3x - p1x)*(p2y - p1y));
                if(area!=0)
                    g.lineTo(x,y);
            }
            lastx = x;
            lasty = y;
        }
    }
    if(typeof(fillColor)=="number")
        g.endFill();

    // Close the path
    if(path.length>2 && typeof(fillColor)=="number"){
        g.moveTo(path[path.length-1][0],path[path.length-1][1]);
        g.lineTo(path[0][0],path[0][1]);
    }
};

PixiDemo.updateSpriteTransform = function(sprite,body,ppu,h){
    if(false){
        sprite.position.x =     body.position[0] * ppu;
        sprite.position.y = h - body.position[1] * ppu;
        sprite.rotation = -body.angle;
    } else {
        // Use interpolated position
        sprite.position.x =     body.interpolatedPosition[0] * ppu;
        sprite.position.y = h - body.interpolatedPosition[1] * ppu;
        sprite.rotation = -body.interpolatedAngle;
    }
};

var X = p2.vec2.fromValues(1,0),
    distVec = p2.vec2.fromValues(0,0),
    worldAnchorA = p2.vec2.fromValues(0,0),
    worldAnchorB = p2.vec2.fromValues(0,0);
PixiDemo.prototype.render = function(){
    var w = this.renderer.width,
        h = this.renderer.height,
        pixelsPerLengthUnit = this.pixelsPerLengthUnit,
        springSprites = this.springSprites,
        sprites = this.sprites;

    // Update body transforms
    for(var i=0; i!==this.bodies.length; i++){
        PixiDemo.updateSpriteTransform(this.sprites[i],this.bodies[i],pixelsPerLengthUnit,h);
    }

    // Update graphics if the body changed sleepState
    for(var i=0; i!==this.bodies.length; i++){
        var isSleeping = (this.bodies[i].sleepState===p2.Body.SLEEPING);
        var sprite = this.sprites[i];
        var body = this.bodies[i];
        if(sprite.drawnSleeping !== isSleeping){
            sprite.clear();
            this.drawRenderable(body, sprite, sprite.drawnColor, sprite.drawnLineColor);
        }
    }

    // Update spring transforms
    for(var i=0; i!==this.springs.length; i++){
        var s = this.springs[i],
            sprite = springSprites[i],
            bA = s.bodyA,
            bB = s.bodyB;
        s.getWorldAnchorA(worldAnchorA);
        s.getWorldAnchorB(worldAnchorB);

        sprite.scale.y = 1;
        if(worldAnchorA[1] < worldAnchorB[1]){
            var tmp = worldAnchorA;
            worldAnchorA = worldAnchorB;
            worldAnchorB = tmp;
            sprite.scale.y = -1;
        }

        var sxA = (     worldAnchorA[0] * pixelsPerLengthUnit ),
            syA = ( h - worldAnchorA[1] * pixelsPerLengthUnit ),
            sxB = (     worldAnchorB[0] * pixelsPerLengthUnit ),
            syB = ( h - worldAnchorB[1] * pixelsPerLengthUnit );

        // Spring position is the mean point between the anchors
        sprite.position.x = ( sxA + sxB ) / 2;
        sprite.position.y = ( syA + syB ) / 2;

        // Compute distance vector between anchors, in screen coords
        distVec[0] = sxA - sxB;
        distVec[1] = syA - syB;

        // Compute angle
        sprite.rotation = -Math.acos( p2.vec2.dot(X, distVec) / p2.vec2.length(distVec) );

        // And scale
        sprite.scale.x = p2.vec2.length(distVec) / (s.restLength * pixelsPerLengthUnit);
    }

    // Clear contacts
    this.contactGraphics.clear();
    if(this.drawContacts){
        this.stage.removeChild(this.contactGraphics);
        this.stage.addChild(this.contactGraphics);

        var g = this.contactGraphics,
            ppu = pixelsPerLengthUnit;
        g.lineStyle(this.lineWidth,0x000000,1);
        for(var i=0; i!==this.world.narrowphase.contactEquations.length; i++){
            var eq = this.world.narrowphase.contactEquations[i],
                bi = eq.bodyA,
                bj = eq.bodyB,
                ri = eq.contactPointA,
                rj = eq.contactPointB,
                xi = (     bi.position[0] * ppu ),
                yi = ( h - bi.position[1] * ppu ),
                xj = (     bj.position[0] * ppu ),
                yj = ( h - bj.position[1] * ppu );

            g.moveTo(xi,yi);
            g.lineTo(xi+ri[0]*ppu,yi-ri[1]*ppu);

            g.moveTo(xj,yj);
            g.lineTo(xj+rj[0]*ppu,yj-rj[1]*ppu);

        }
    }

    this.renderer.render(this.container);
};

//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}
//http://stackoverflow.com/questions/43044/algorithm-to-randomly-generate-an-aesthetically-pleasing-color-palette
function randomPastelHex(){
    var mix = [255,255,255];
    var red =   Math.floor(Math.random()*256);
    var green = Math.floor(Math.random()*256);
    var blue =  Math.floor(Math.random()*256);

    // mix the color
    red =   Math.floor((red +   3*mix[0]) / 4);
    green = Math.floor((green + 3*mix[1]) / 4);
    blue =  Math.floor((blue +  3*mix[2]) / 4);

    return rgbToHex(red,green,blue);
    return rgbToHex(red,green,blue);
}

PixiDemo.prototype.drawRenderable = function(obj, graphics, color, lineColor){
    var ppu = this.pixelsPerLengthUnit,
        lw = this.lineWidth;

    var zero = [0,0];
    graphics.drawnSleeping = false;
    graphics.drawnColor = color;
    graphics.drawnLineColor = lineColor;

    if(obj instanceof p2.Body && obj.shapes.length){

        var isSleeping = (obj.sleepState === p2.Body.SLEEPING);
        graphics.drawnSleeping = isSleeping;

        if(obj.concavePath && !this.debugPolygons){
            var path = [];
            for(var j=0; j!==obj.concavePath.length; j++){
                var v = obj.concavePath[j];
                path.push([v[0]*ppu, -v[1]*ppu]);
            }
            this.drawPath(graphics, path, lineColor, color, lw, isSleeping);
        } else {
            for(var i=0; i<obj.shapes.length; i++){
                var child = obj.shapes[i],
                    offset = obj.shapeOffsets[i],
                    angle = obj.shapeAngles[i];
                offset = offset || zero;
                angle = angle || 0;

                if(child instanceof p2.Circle){
                    this.drawCircle(graphics,offset[0]*ppu,-offset[1]*ppu,angle,child.radius*ppu,color,lw,isSleeping);

                } else if(child instanceof p2.Particle){
                    this.drawCircle(graphics,offset[0]*ppu,-offset[1]*ppu,angle,2*lw,lineColor,0);

                } else if(child instanceof p2.Plane){
                    // TODO use shape angle
                    PixiDemo.drawPlane(graphics, -10*ppu, 10*ppu, color, lineColor, lw, lw*10, lw*10, ppu*100);

                } else if(child instanceof p2.Line){
                    PixiDemo.drawLine(graphics, child.length*ppu, lineColor, lw);

                } else if(child instanceof p2.Rectangle){
                    this.drawRectangle(graphics, offset[0]*ppu, -offset[1]*ppu, angle, child.width*ppu, child.height*ppu, lineColor, color, lw, isSleeping);

                } else if(child instanceof p2.Capsule){
                    this.drawCapsule(graphics, offset[0]*ppu, -offset[1]*ppu, angle, child.length*ppu, child.radius*ppu, lineColor, color, lw, isSleeping);

                } else if(child instanceof p2.Convex){
                    // Scale verts
                    var verts = [],
                        vrot = p2.vec2.create();
                    for(var j=0; j!==child.vertices.length; j++){
                        var v = child.vertices[j];
                        p2.vec2.rotate(vrot, v, angle);
                        verts.push([(vrot[0]+offset[0])*ppu, -(vrot[1]+offset[1])*ppu]);
                    }

                    this.drawConvex(graphics, verts, child.triangles, lineColor, color, lw, this.debugPolygons,[offset[0]*ppu,-offset[1]*ppu], isSleeping);
                }
            }
        }

    } else if(obj instanceof p2.Spring){
        var restLengthPixels = obj.restLength * ppu;
        PixiDemo.drawSpring(graphics,restLengthPixels,0x000000,lw);
    }
};

PixiDemo.prototype.addRenderable = function(obj){
    var ppu = this.pixelsPerLengthUnit,
        lw = this.lineWidth;

    // Random color
    var color = parseInt(randomPastelHex(),16),
        lineColor = 0x000000;

    var zero = [0,0];

    var sprite = new PIXI.Graphics();
    if(obj instanceof p2.Body && obj.shapes.length){

        this.drawRenderable(obj, sprite, color, lineColor);
        /*
        if(obj.concavePath && !this.debugPolygons){
            var path = [];
            for(var j=0; j!==obj.concavePath.length; j++){
                var v = obj.concavePath[j];
                path.push([v[0]*ppu, -v[1]*ppu]);
            }
            PixiDemo.drawPath(sprite, path, lineColor, color, lw);
        } else {
            for(var i=0; i<obj.shapes.length; i++){
                var child = obj.shapes[i],
                    offset = obj.shapeOffsets[i],
                    angle = obj.shapeAngles[i];
                offset = offset || zero;
                angle = angle || 0;

                if(child instanceof p2.Circle){
                    this.drawCircle(sprite,offset[0]*ppu,-offset[1]*ppu,angle,child.radius*ppu,color,lw);

                } else if(child instanceof p2.Particle){
                    this.drawCircle(sprite,offset[0]*ppu,-offset[1]*ppu,angle,2*lw,lineColor,0);

                } else if(child instanceof p2.Plane){
                    // TODO use shape angle
                    PixiDemo.drawPlane(sprite, -10*ppu, 10*ppu, color, lineColor, lw, lw*10, lw*10, ppu*100);

                } else if(child instanceof p2.Line){
                    PixiDemo.drawLine(sprite, child.length*ppu, lineColor, lw);

                } else if(child instanceof p2.Rectangle){
                    this.drawRectangle(sprite, offset[0]*ppu, -offset[1]*ppu, angle, child.width*ppu, child.height*ppu, lineColor, color, lw);

                } else if(child instanceof p2.Capsule){
                    PixiDemo.drawCapsule(sprite, offset[0]*ppu, -offset[1]*ppu, angle, child.length*ppu, child.radius*ppu, lineColor, color,lw);

                } else if(child instanceof p2.Convex){
                    // Scale verts
                    var verts = [],
                        vrot = p2.vec2.create();
                    for(var j=0; j!==child.vertices.length; j++){
                        var v = child.vertices[j];
                        p2.vec2.rotate(vrot, v, angle);
                        verts.push([(vrot[0]+offset[0])*ppu, -(vrot[1]+offset[1])*ppu]);
                    }

                    this.drawConvex(sprite, verts, child.triangles, lineColor, color, lw, this.debugPolygons,[offset[0]*ppu,-offset[1]*ppu]);
                }
            }
        }
        */
        this.sprites.push(sprite);
        this.stage.addChild(sprite);

    } else if(obj instanceof p2.Spring){
        /*
        var restLengthPixels = obj.restLength * ppu;
        var restLengthPixels = obj.restLength * ppu;
        PixiDemo.drawSpring(sprite,restLengthPixels,0x000000,lw);
        */
        this.drawRenderable(obj, sprite, 0x000000, lineColor);
        this.springSprites.push(sprite);
        this.stage.addChild(sprite);
    }
};

PixiDemo.prototype.removeRenderable = function(obj){
    if(obj instanceof p2.Body){
        var i = this.bodies.indexOf(obj);
        if(i!=-1){
            this.stage.removeChild(this.sprites[i]);
            this.sprites.splice(i,1);
        }
    } else if(obj instanceof p2.Spring){
        var i = this.springs.indexOf(obj);
        if(i!=-1){
            this.stage.removeChild(this.springSprites[i]);
            this.springSprites.splice(i,1);
        }
    }
};

PixiDemo.prototype.resize = function(w,h){
    /*
    var renderer = this.renderer;
    var view = renderer.view;

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
    */
};
