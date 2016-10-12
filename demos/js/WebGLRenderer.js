/* global PIXI,Renderer */

(function(p2){

p2.WebGLRenderer = WebGLRenderer;

var vec2 = p2.vec2;
var Renderer = p2.Renderer;

function copyPixiVector(out, pixiVector){
    out[0] = pixiVector.x;
    out[1] = pixiVector.y;
}

function smoothDamp(current, target, store, deltaTime, smoothTime, maxSpeed) {
	if (smoothTime === undefined) {
		smoothTime = 0.3;
	}
	if (maxSpeed === undefined) {
		maxSpeed = 1e7;
	}

	smoothTime = Math.max(0.0001, smoothTime);
	var num = 2 / smoothTime;
	var num2 = num * deltaTime;
	var num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
	var num4 = current - target;
	var num5 = target;
	var num6 = maxSpeed * smoothTime;
	num4 = Math.max(-num6, Math.min(num6, num4));
	target = current - num4;
	var currentVelocity = store.y;
	var num7 = (currentVelocity + num * num4) * deltaTime;
	currentVelocity = (currentVelocity - num * num7) * num3;
	var num8 = target + (num4 + num7) * num3;
	if (num5 - current > 0 === num8 > num5){
		num8 = num5;
		currentVelocity = (num8 - num5) / deltaTime;
	}
	store.x = num8;
	store.y = currentVelocity;

	return num8;
}

/**
 * Renderer using Pixi.js
 * @class WebGLRenderer
 * @constructor
 * @extends Renderer
 * @param {World}   scenes
 * @param {Object}  [options]
 * @param {Number}  [options.lineWidth=0.01]
 * @param {Number}  [options.scrollFactor=0.1]
 * @param {Number}  [options.width]               Num pixels in horizontal direction
 * @param {Number}  [options.height]              Num pixels in vertical direction
 */
function WebGLRenderer(scenes, options){
    options = options || {};

    var that = this;

    var settings = {
        lineColor: 0x000000,
        lineWidth : 0.01,
        scrollFactor : 0.1,
        width : 1280, // Pixi screen resolution
        height : 720,
        useDeviceAspect : false,
        sleepOpacity : 0.2
    };
    for(var key in options){
        settings[key] = options[key];
    }

    if(settings.useDeviceAspect){
        settings.height = window.innerHeight / window.innerWidth * settings.width;
    }

    this.lineWidth =            settings.lineWidth;
    this.lineColor =            settings.lineColor;
    this.drawLineColor =        0xff0000;
    this.scrollFactor =         settings.scrollFactor;
    this.sleepOpacity =         settings.sleepOpacity;

    this.sprites = [];
    this.springSprites = [];
    this.debugPolygons = false;

    this.islandColors = {}; // id -> int
    this.islandStaticColor = 0xdddddd;

    this.startMouseDelta = vec2.create();
    this.startCamPos = vec2.create();

    this.pickPrecision = 0.1;
    this.touchPositions = {}; // identifier => vec2 in physics space
    this.mouseDown = false;

    this._zoomStore = {};
    this._cameraStoreX = {};
    this._cameraStoreY = {};

    Renderer.call(this,scenes,options);

    this.currentZoom = this.zoom;
    this.currentStageX = 0;
    this.currentStageY = 0;

    for(var key in settings){
        this.settings[key] = settings[key];
    }


    // Update "ghost draw line"
    this.on("drawPointsChange",function(/*e*/){
        var g = that.drawShapeGraphics;
        var path = that.drawPoints;

        if(!g.parent){
            that.stage.addChild(g);
        }

        g.clear();

        if(!path.length){
            that.stage.removeChild(g);
            return;
        }

        var path2 = [];
        for(var j=0; j<path.length; j++){
            var v = path[j];
            path2.push([v[0], v[1]]);
        }

        that.drawPath(g, path2, that.lineWidth, that.drawLineColor, that.lineColor, 0);
    });

    // Update draw circle
    this.on("drawCircleChange",function(/*e*/){
        var g = that.drawShapeGraphics;
        if(!g.parent){
            that.stage.addChild(g);
        }
        g.clear();
        var tmpCircle = new p2.Circle({
            radius: vec2.distance(that.drawCircleCenter, that.drawCirclePoint),
            position: that.drawCircleCenter
        });
        that.drawCircle(g, tmpCircle, 0x000000, 0, that.lineWidth);
    });

    // Update draw circle
    this.on("drawRectangleChange",function(/*e*/){
        var g = that.drawShapeGraphics;
        if(!g.parent){
            that.stage.addChild(g);
        }
        g.clear();
        var start = that.drawRectStart;
        var end = that.drawRectEnd;
        var w = start[0] - end[0];
        var h = start[1] - end[1];
        var tmpBox = new p2.Box({
            width: Math.abs(w),
            height: Math.abs(h),
            position: [
                start[0] - w/2,
                start[1] - h/2
            ]
        });
        that.drawRectangle(g, tmpBox, 0, 0, that.lineWidth);
    });
}
WebGLRenderer.prototype = Object.create(Renderer.prototype);

/**
 * Initialize the renderer and stage
 */
var init_physicsPosition = vec2.create();
WebGLRenderer.prototype.init = function(){
    var s = this.settings;

    var that = this;

    this.renderer =     PIXI.autoDetectRenderer(s.width, s.height, { backgroundColor: 0xFFFFFF });
    var stage =     this.stage =        new PIXI.Container();
    var container = this.container =    new PIXI.Container();
    container.interactive = stage.interactive = true;

    container.hitArea = new PIXI.Rectangle(0,0,1e7,1e7);

    var el = this.element = this.renderer.view;
    el.tabIndex = 1;
    el.classList.add(Renderer.elementClass);
    el.setAttribute('style','width:100%;');

    var div = this.elementContainer = document.createElement('div');
    div.classList.add(Renderer.containerClass);
    div.setAttribute('style','width:100%; height:100%');
    div.appendChild(el);
    document.body.appendChild(div);
    el.focus();
    el.oncontextmenu = function(){
        return false;
    };

    this.container.addChild(stage);

    // Graphics object for drawing shapes
    this.drawShapeGraphics = new PIXI.Graphics();

    // Graphics object for contacts
    this.contactGraphics = new PIXI.Graphics();

    // Graphics object for AABBs
    this.aabbGraphics = new PIXI.Graphics();

    // Graphics object for pick
    this.pickGraphics = new PIXI.Graphics();

    stage.scale.set(this.zoom, -this.zoom); // Flip Y direction since pixi has down as Y axis

    var physicsPosA = vec2.create();
    var physicsPosB = vec2.create();
    var initPinchCenter = vec2.create();
    var touchPanDelta = vec2.create();
    var lastPinchLength = 0;
    var startZoom = 1;

    container.mousedown = container.touchstart = function(e){

        // store touch state
        if(e.data.identifier !== undefined){
            var touchPos = vec2.create();
            copyPixiVector(touchPos, e.data.getLocalPosition(stage));
            that.touchPositions[e.data.identifier] = touchPos;
        }

        if(e.data.originalEvent.touches && e.data.originalEvent.touches.length === 2){
            var pos = new PIXI.Point();
            var touchA = e.data.originalEvent.touches[0];
            var touchB = e.data.originalEvent.touches[1];

            e.data.getLocalPosition(stage, pos, new PIXI.Point(touchA.clientX * that.getDevicePixelRatio(), touchA.clientY * that.getDevicePixelRatio()));
            copyPixiVector(physicsPosA, pos);

            e.data.getLocalPosition(stage, pos, new PIXI.Point(touchB.clientX * that.getDevicePixelRatio(), touchB.clientY * that.getDevicePixelRatio()));
            copyPixiVector(physicsPosB, pos);

            lastPinchLength = vec2.distance(physicsPosA, physicsPosB);
            startZoom = that.zoom;
            vec2.add(initPinchCenter, physicsPosA, physicsPosB);
            vec2.scale(initPinchCenter, initPinchCenter, 0.5);

            return;
        }

        that.mouseDown = true;

        var pos = e.data.getLocalPosition(stage);
        copyPixiVector(init_physicsPosition, pos);
        that.handleMouseDown(init_physicsPosition);

        copyPixiVector(that.startMouseDelta, e.data.global);
        vec2.copy(that.startCamPos, that.cameraPosition);
    };

    container.mousemove = container.touchmove = function(e){

        // store touch state
        if(e.data.identifier !== undefined){
            copyPixiVector(that.touchPositions[e.data.identifier], e.data.getLocalPosition(stage));
        }

        var numTouchesDown = that.getNumTouches();

        if(numTouchesDown === 2){
            var physicsPosA = that.getTouchPosition(0);
            var physicsPosB = that.getTouchPosition(1);
            var pinchLength = vec2.distance(physicsPosA, physicsPosB);

            // Get center
            var center = vec2.create();
            vec2.add(center, physicsPosA, physicsPosB);
            vec2.scale(center, center, 0.5);

            that.setZoom(
                startZoom * pinchLength / lastPinchLength
                /*center,
                (pinchLength - lastPinchLength) / (that.renderer.height / that.zoom) * 2*/
            );
            //lastPinchLength = pinchLength;

            vec2.subtract(touchPanDelta, initPinchCenter, center);
            vec2.add(touchPanDelta, touchPanDelta, that.cameraPosition);

            //that.setCameraCenter(touchPanDelta);

            return;
        }

        if((that.mouseDown || numTouchesDown !== 0) && that.state === Renderer.PANNING){
            var delta = vec2.create();
            var currentMousePosition = vec2.create();
            copyPixiVector(currentMousePosition, e.data.global);
            vec2.subtract(delta, currentMousePosition, that.startMouseDelta);
            that.domVectorToPhysics(delta, delta);

            // When we move mouse up, camera should go down
            vec2.scale(delta, delta, -1);

            // Add delta to the camera position where the panning started
            vec2.add(delta, delta, that.startCamPos);

            // Set new camera position
            that.setCameraCenter(delta);
        }

        var pos = e.data.getLocalPosition(stage);
        copyPixiVector(init_physicsPosition, pos);
        that.handleMouseMove(init_physicsPosition);
    };

    container.mouseup = function(e){
        that.mouseDown = false;
        var pos = e.data.getLocalPosition(stage);
        copyPixiVector(init_physicsPosition, pos);

        that.handleMouseUp(init_physicsPosition);
    };

    container.touchend = function(e){
        delete that.touchPositions[e.data.identifier];
        var pos = e.data.getLocalPosition(stage);
        copyPixiVector(init_physicsPosition, pos);

        that.handleMouseUp(init_physicsPosition);
    };

    // http://stackoverflow.com/questions/7691551/touchend-event-in-ios-webkit-not-firing
    this.element.ontouchmove = function(e){
        e.preventDefault();
    };

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        e = window.event || e; // old IE support

        var o = e,
            d = o.detail, w = o.wheelDelta,
            n = 225, n1 = n-1;

        // Normalize delta: http://stackoverflow.com/a/13650579/2285811
        var f;
        d = d ? w && (f = w/d) ? d/f : -d/1.35 : w/120;
        // Quadratic scale if |d| > 1
        d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
        // Delta *should* not be greater than 2...
        var delta = Math.min(Math.max(d / 2, -1), 1);

        if(delta){
            var point = that.domToPhysics([e.clientX, e.clientY]);
            that.zoomAroundPoint(point, delta > 0 ? 0.05 : -0.05);
        }
    }

    if (el.addEventListener) {
        el.addEventListener("mousewheel", MouseWheelHandler, false); // IE9, Chrome, Safari, Opera
        el.addEventListener("DOMMouseScroll", MouseWheelHandler, false); // Firefox
    } else {
        el.attachEvent("onmousewheel", MouseWheelHandler); // IE 6/7/8
    }

    this.setCameraCenter([0, 0]);
};

WebGLRenderer.prototype.getNumTouches = function(){
    var touchPositions = this.touchPositions;
    var touchIdentifiers = Object.keys(touchPositions);
    var numTouchesDown = 0;
    for(var i=0; i<touchIdentifiers.length; i++){
        if(touchPositions[touchIdentifiers[i]]){
            numTouchesDown++;
        }
    }
    return numTouchesDown;
};

WebGLRenderer.prototype.getTouchPosition = function(i){
    var touchPositions = this.touchPositions;
    var touchIdentifiers = Object.keys(touchPositions);
    return touchPositions[touchIdentifiers[i]];
};

WebGLRenderer.prototype.domToPhysics = function(point){
    var result = this.stage.toLocal(new PIXI.Point(point[0], point[1]));
    return [result.x, result.y];
};

WebGLRenderer.prototype.domVectorToPhysics = function(vector, result){
    result[0] = vector[0] / this.zoom;
    result[1] = -vector[1] / this.zoom;
};

WebGLRenderer.prototype.onCameraPositionChanged = function(){
    // TODO: can this be simplified by adding another PIXI.Container?
    /*
    this.stage.position.set(
        this.renderer.width / 2 - this.stage.scale.x * this.cameraPosition[0],
        this.renderer.height / 2 - this.stage.scale.y * this.cameraPosition[1]
    );
    this.stage.updateTransform();
    */
};

WebGLRenderer.prototype.onZoomChanged = function(){
    /*
    this.stage.scale.set(this.zoom, -this.zoom);
    this.stage.updateTransform();
    */
};

/**
 * Make sure that a rectangle is visible in the canvas.
 * @param  {number} centerX
 * @param  {number} centerY
 * @param  {number} width
 * @param  {number} height
 */
WebGLRenderer.prototype.frame = function(centerX, centerY, width, height){
    var renderer = this.renderer;
    this.setCameraCenter([centerX, centerY]);
    var ratio = renderer.width / renderer.height;

    var zoom;
    if(ratio < width / height){
        zoom = renderer.width / width;
    } else {
        zoom = renderer.height / height;
    }
    this.setZoom(zoom);
};

function pixiDrawCircleOnGraphics(g, x, y, radius){
    var maxSegments = 32;
    var minSegments = 12;

    var alpha = (radius - 0.1) / 1;
    alpha = Math.max(Math.min(alpha, 1), 0);

    var numSegments = Math.round(
        maxSegments * alpha + minSegments * (1-alpha)
    );

    var circlePath = [];
    for(var i=0; i<numSegments+1; i++){
        var a = Math.PI * 2 / numSegments * i;
        circlePath.push(
            new PIXI.Point(
                x + radius * Math.cos(a),
                y + radius * Math.sin(a)
            )
        );
    }

    g.drawPolygon(circlePath);
}

WebGLRenderer.prototype.drawSpring = function(g,restLength,color,lineWidth){
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

WebGLRenderer.prototype.shapeDrawFunctions = {};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.PARTICLE] =
WebGLRenderer.prototype.drawParticle = function(graphics, particleShape, color, alpha, lineWidth){
    this.drawCircle(graphics, particleShape, color, alpha, lineWidth);
};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.CIRCLE] =
WebGLRenderer.prototype.drawCircle = function(g, circleShape, color, alpha, lineWidth){
    g.lineStyle(lineWidth, this.lineColor, 1);
    g.beginFill(color, alpha);
    var x = circleShape.position[0];
    var y = circleShape.position[1];
    var r = circleShape.radius;
    pixiDrawCircleOnGraphics(g, x, y, r, 20);
    g.endFill();

    // line from center to edge
    g.moveTo(x,y);
    g.lineTo(   x + r * Math.cos(circleShape.angle),
                y + r * Math.sin(circleShape.angle) );
};

/**
 * Draw a finite plane onto a PIXI.Graphics.
 * @method drawPlane
 * @param  {PIXI.Graphics} g
 * @param  {Number} x0
 * @param  {Number} x1
 * @param  {Number} color
 * @param  {Number} lineWidth
 * @param  {Number} diagMargin
 * @param  {Number} diagSize
 * @todo Should consider an angle
 */
WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.PLANE] =
WebGLRenderer.prototype.drawPlane = function(g, planeShape, color, alpha, lineWidth){
    g.lineStyle(lineWidth, this.lineColor, 1);

    // Draw a fill color
    g.lineStyle(0,0,0);
    g.beginFill(color);
    var max = 100;
    g.moveTo(-max,0);
    g.lineTo(max,0);
    g.lineTo(max,-max);
    g.lineTo(-max,-max);
    g.endFill();

    // Draw the actual plane
    g.lineStyle(lineWidth, this.lineColor);
    g.moveTo(-max,0);
    g.lineTo(max,0);
};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.LINE] =
WebGLRenderer.prototype.drawLine = function(g, shape, color, alpha, lineWidth){
    var len = shape.length;
    var angle = shape.angle;
    var offset = shape.position;

    g.lineStyle(lineWidth, color, 1);

    var startPoint = vec2.fromValues(-len/2,0);
    var endPoint = vec2.fromValues(len/2,0);

    vec2.rotate(startPoint, startPoint, angle);
    vec2.rotate(endPoint, endPoint, angle);

    vec2.add(startPoint, startPoint, offset);
    vec2.add(endPoint, endPoint, offset);

    g.moveTo(startPoint[0], startPoint[1]);
    g.lineTo(endPoint[0], endPoint[1]);
};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.CAPSULE] =
WebGLRenderer.prototype.drawCapsule = function(g, shape, color, alpha, lineWidth){
    var angle = shape.angle;
    var radius = shape.radius;
    var len = shape.length;
    var x = shape.position[0];
    var y = shape.position[1];

    g.lineStyle(lineWidth, this.lineColor, 1);

    // Draw circles at ends
    var hl = len / 2;
    g.beginFill(color, alpha);
    var localPos = vec2.fromValues(x, y);
    var p0 = vec2.fromValues(-hl, 0);
    var p1 = vec2.fromValues(hl, 0);
    vec2.rotate(p0, p0, angle);
    vec2.rotate(p1, p1, angle);
    vec2.add(p0, p0, localPos);
    vec2.add(p1, p1, localPos);
    pixiDrawCircleOnGraphics(g, p0[0], p0[1], radius, 20);
    pixiDrawCircleOnGraphics(g, p1[0], p1[1], radius, 20);
    g.endFill();

    // Draw rectangle
    var pp2 = vec2.create();
    var p3 = vec2.create();
    vec2.set(p0, -hl, radius);
    vec2.set(p1, hl, radius);
    vec2.set(pp2, hl, -radius);
    vec2.set(p3, -hl, -radius);

    vec2.rotate(p0, p0, angle);
    vec2.rotate(p1, p1, angle);
    vec2.rotate(pp2, pp2, angle);
    vec2.rotate(p3, p3, angle);

    vec2.add(p0, p0, localPos);
    vec2.add(p1, p1, localPos);
    vec2.add(pp2, pp2, localPos);
    vec2.add(p3, p3, localPos);

    g.lineStyle(lineWidth, this.lineColor, 0);
    g.beginFill(color, alpha);
    g.moveTo(p0[0], p0[1]);
    g.lineTo(p1[0], p1[1]);
    g.lineTo(pp2[0], pp2[1]);
    g.lineTo(p3[0], p3[1]);
    g.endFill();

    // Draw lines in between
    for(var i=0; i<2; i++){
        g.lineStyle(lineWidth, this.lineColor, 1);
        var sign = (i===0?1:-1);
        vec2.set(p0, -hl, sign*radius);
        vec2.set(p1, hl, sign*radius);
        vec2.rotate(p0, p0, angle);
        vec2.rotate(p1, p1, angle);
        vec2.add(p0, p0, localPos);
        vec2.add(p1, p1, localPos);
        g.moveTo(p0[0], p0[1]);
        g.lineTo(p1[0], p1[1]);
    }

};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.BOX] =
WebGLRenderer.prototype.drawRectangle = function(g, shape, color, alpha, lineWidth){
    var w = shape.width;
    var h = shape.height;
    var x = shape.position[0];
    var y = shape.position[1];

    var path = [
        [w / 2, h / 2],
        [-w / 2, h / 2],
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2]
    ];

    // Rotate and add position
    for (var i = 0; i < path.length; i++) {
        var v = path[i];
        vec2.rotate(v, v, shape.angle);
        vec2.add(v, v, [x, y]);
    }

    this.drawPath(g, path, lineWidth, this.lineColor, color, alpha);
};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.HEIGHTFIELD] =
WebGLRenderer.prototype.drawHeightfield = function(g, shape, color, alpha, lineWidth){
    var path = [[0,-100]];
    for(var j=0; j!==shape.heights.length; j++){
        var v = shape.heights[j];
        path.push([j*shape.elementWidth, v]);
    }
    path.push([shape.heights.length * shape.elementWidth, -100]);
    this.drawPath(g, path, lineWidth, this.lineColor, color, alpha);
};

WebGLRenderer.prototype.shapeDrawFunctions[p2.Shape.CONVEX] =
WebGLRenderer.prototype.drawConvex = function(g, shape, color, alpha, lineWidth){
    var verts = [];
    var vrot = vec2.create();
    var offset = shape.position;

    for(var j=0; j!==shape.vertices.length; j++){
        var v = shape.vertices[j];
        vec2.rotate(vrot, v, shape.angle);
        verts.push([(vrot[0]+offset[0]), (vrot[1]+offset[1])]);
    }

    g.lineStyle(lineWidth, this.lineColor, 1);
    g.beginFill(color, alpha);
    for(var i=0; i!==verts.length; i++){
        var v = verts[i],
            x = v[0],
            y = v[1];
        if(i===0){
            g.moveTo(x,y);
        } else {
            g.lineTo(x,y);
        }
    }
    g.endFill();

    if(verts.length>2){
        g.moveTo(verts[verts.length-1][0],verts[verts.length-1][1]);
        g.lineTo(verts[0][0],verts[0][1]);
    }
};

WebGLRenderer.prototype.drawPath = function(g, path, lineWidth, lineColor, fillColor, fillAlpha){
    g.lineStyle(lineWidth, lineColor, 1);

    if(fillAlpha !== 0){
        g.beginFill(fillColor, fillAlpha);
    }

    var poly = [];
    for(var i=0; i<path.length; i++){
        var p = path[i];
        poly.push(new PIXI.Point(p[0], p[1]));
    }
    g.drawPolygon(poly);

    if(fillAlpha !== 0){
        g.endFill();
    }

    // Close the path
    if(path.length>2 && fillAlpha !== 0){
        g.moveTo(path[path.length-1][0], path[path.length-1][1]);
        g.lineTo(path[0][0],path[0][1]);
    }
};

WebGLRenderer.prototype.updateSpriteTransform = function(sprite,body){
    if(this.useInterpolatedPositions && !this.paused){
        sprite.position.set(body.interpolatedPosition[0], body.interpolatedPosition[1]);
        sprite.rotation = body.interpolatedAngle;
    } else {
        sprite.position.set(body.position[0], body.position[1]);
        sprite.rotation = body.angle;
    }
};

var X = vec2.fromValues(1,0),
    distVec = vec2.fromValues(0,0),
    worldAnchorA = vec2.fromValues(0,0),
    worldAnchorB = vec2.fromValues(0,0);
WebGLRenderer.prototype.render = function(deltaTime){
    var stage = this.stage;
    var springSprites = this.springSprites;

    // Damp position
    this.currentStageX = smoothDamp(this.currentStageX, this.renderer.width / 2 - this.zoom * this.cameraPosition[0], this._cameraStoreX, deltaTime, 0.03, 1e7);
    this.currentStageY = smoothDamp(this.currentStageY, this.renderer.height / 2 + this.zoom * this.cameraPosition[1], this._cameraStoreY, deltaTime, 0.03, 1e7);
    this.stage.position.set(
        this.currentStageX,
        this.currentStageY
    );

    // Damp zoom
    this.currentZoom = smoothDamp(this.currentZoom, this.zoom, this._zoomStore, deltaTime, 0.03, 1e7);
    this.stage.scale.set(this.currentZoom, -this.currentZoom);

    this.stage.updateTransform();

    // Update body transforms
    for(var i=0; i!==this.bodies.length; i++){
        this.updateSpriteTransform(this.sprites[i],this.bodies[i]);
    }

    // Update graphics if the body changed sleepState or island
    for(var i=0; i!==this.bodies.length; i++){
        var body = this.bodies[i];
        var isSleeping = (body.sleepState===p2.Body.SLEEPING);
        var sprite = this.sprites[i];
        var islandColor = this.getIslandColor(body);
        if(sprite.drawnSleeping !== isSleeping || sprite.drawnColor !== islandColor){
            sprite.clear();
            this.drawRenderable(body, sprite, islandColor, sprite.drawnLineColor);
        }
    }

    // Update spring transforms
    for(var i=0; i!==this.springs.length; i++){
        var s = this.springs[i],
            sprite = springSprites[i],
            bA = s.bodyA,
            bB = s.bodyB;

        if(this.useInterpolatedPositions && !this.paused){
            vec2.toGlobalFrame(worldAnchorA, s.localAnchorA, bA.interpolatedPosition, bA.interpolatedAngle);
            vec2.toGlobalFrame(worldAnchorB, s.localAnchorB, bB.interpolatedPosition, bB.interpolatedAngle);
        } else {
            s.getWorldAnchorA(worldAnchorA);
            s.getWorldAnchorB(worldAnchorB);
        }

        sprite.scale.y = 1;
        if(worldAnchorA[1] < worldAnchorB[1]){
            var tmp = worldAnchorA;
            worldAnchorA = worldAnchorB;
            worldAnchorB = tmp;
            sprite.scale.y = -1;
        }

        var sxA = worldAnchorA[0],
            syA = worldAnchorA[1],
            sxB = worldAnchorB[0],
            syB = worldAnchorB[1];

        // Spring position is the mean point between the anchors
        sprite.position.set(
            ( sxA + sxB ) / 2,
            ( syA + syB ) / 2
        );

        // Compute distance vector between anchors, in screen coords
        vec2.set(distVec, sxA - sxB, syA - syB);

        // Compute angle
        sprite.rotation = Math.acos( vec2.dot(X, distVec) / vec2.length(distVec) );

        // And scale
        sprite.scale.x = vec2.length(distVec) / s.restLength;
    }

    // Clear contacts
    if(this.drawContacts){
        this.contactGraphics.clear();

        // Keep it on top
        stage.removeChild(this.contactGraphics);
        stage.addChild(this.contactGraphics);

        var g = this.contactGraphics;
        g.lineStyle(this.lineWidth, 0x000000, 1);
        for(var i=0; i!==this.world.narrowphase.contactEquations.length; i++){
            var eq = this.world.narrowphase.contactEquations[i],
                bi = eq.bodyA,
                bj = eq.bodyB,
                ri = eq.contactPointA,
                rj = eq.contactPointB,
                xi = bi.position[0],
                yi = bi.position[1],
                xj = bj.position[0],
                yj = bj.position[1];

            g.moveTo(xi,yi);
            g.lineTo(xi+ri[0], yi+ri[1]);

            g.moveTo(xj,yj);
            g.lineTo(xj+rj[0], yj+rj[1]);

        }
        this.contactGraphics.cleared = false;
    } else if(!this.contactGraphics.cleared){
        this.contactGraphics.clear();
        this.contactGraphics.cleared = true;
    }

    // Draw AABBs
    if(this.drawAABBs){
        this.aabbGraphics.clear();
        stage.removeChild(this.aabbGraphics);
        stage.addChild(this.aabbGraphics);
        var g = this.aabbGraphics;
        g.lineStyle(this.lineWidth,0x000000,1);

        for(var i=0; i!==this.world.bodies.length; i++){
            var aabb = this.world.bodies[i].getAABB();
            g.drawRect(aabb.lowerBound[0], aabb.lowerBound[1], aabb.upperBound[0] - aabb.lowerBound[0], aabb.upperBound[1] - aabb.lowerBound[1]);
        }
        this.aabbGraphics.cleared = false;
    } else if(!this.aabbGraphics.cleared){
        this.aabbGraphics.clear();
        this.aabbGraphics.cleared = true;
    }

    // Draw pick line
    if(this.mouseConstraint){
        var g = this.pickGraphics;
        g.clear();
        stage.removeChild(g);
        stage.addChild(g);
        g.lineStyle(this.lineWidth,0x000000,1);
        var c = this.mouseConstraint;
        var worldPivotB = vec2.create();
        c.bodyB.toWorldFrame(worldPivotB, c.pivotB);
        g.moveTo(c.pivotA[0], c.pivotA[1]);
        g.lineTo(worldPivotB[0], worldPivotB[1]);
        g.cleared = false;
    } else if(!this.pickGraphics.cleared){
        this.pickGraphics.clear();
        this.pickGraphics.cleared = true;
    }

    if(this.followBody){
        this.setCameraCenter(this.followBody.interpolatedPosition);
    }

    this.renderer.render(this.container);
};

//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//http://stackoverflow.com/questions/43044/algorithm-to-randomly-generate-an-aesthetically-pleasing-color-palette
WebGLRenderer.randomColor = function(){
    var mix = [255,255,255];
    var red =   Math.floor(Math.random()*256);
    var green = Math.floor(Math.random()*256);
    var blue =  Math.floor(Math.random()*256);

    // mix the color
    red =   Math.floor((red +   3*mix[0]) / 4);
    green = Math.floor((green + 3*mix[1]) / 4);
    blue =  Math.floor((blue +  3*mix[2]) / 4);

    return rgbToHex(red,green,blue);
};

WebGLRenderer.prototype.drawRenderable = function(obj, graphics, color, lineColor){
    var lw = this.lineWidth;

    graphics.drawnSleeping = false;
    graphics.drawnColor = color;
    graphics.drawnLineColor = lineColor;
    if(obj instanceof p2.Body && obj.shapes.length){

        var isSleeping = (obj.sleepState === p2.Body.SLEEPING);
        var alpha = isSleeping ? this.sleepOpacity : 1;

        graphics.drawnSleeping = isSleeping;

        if(this.bodyPolygonPaths[obj.id] && !this.debugPolygons){
            // Special case: bodies created using Body#fromPolygon
            this.drawPath(graphics, this.bodyPolygonPaths[obj.id], lw, lineColor, color, alpha);
        } else {
            // Draw all shapes
            for(var i=0; i<obj.shapes.length; i++){
                var child = obj.shapes[i];

                var drawFunction = this.shapeDrawFunctions[child.type];
                if(drawFunction){
                    drawFunction.call(this, graphics, child, color, alpha, lw);
                }
            }
        }

    } else if(obj instanceof p2.Spring){
        var restLengthPixels = obj.restLength;
        this.drawSpring(graphics, restLengthPixels, lineColor, lw);
    }
};

WebGLRenderer.prototype.getIslandColor = function(body){
    var islandColors = this.islandColors;
    var color;
    if(body.islandId === -1){
        color = this.islandStaticColor; // Gray for static objects
    } else if(islandColors[body.islandId]){
        color = islandColors[body.islandId];
    } else {
        color = islandColors[body.islandId] = parseInt(WebGLRenderer.randomColor(),16);
    }
    return color;
};

WebGLRenderer.prototype.addRenderable = function(obj){

    var lineColor = this.lineColor;

    var sprite = new PIXI.Graphics();
    if(obj instanceof p2.Body && obj.shapes.length){

        var color = this.getIslandColor(obj);
        this.drawRenderable(obj, sprite, color, lineColor);
        this.sprites.push(sprite);
        this.stage.addChild(sprite);

    } else if(obj instanceof p2.Spring){

        this.drawRenderable(obj, sprite, lineColor, lineColor);
        this.springSprites.push(sprite);
        this.stage.addChild(sprite);

    }
};

WebGLRenderer.prototype.removeRenderable = function(obj){
    if(obj instanceof p2.Body){
        var i = this.bodies.indexOf(obj);
        if(i!==-1){
            this.stage.removeChild(this.sprites[i]);
            this.sprites.splice(i,1);
        }
    } else if(obj instanceof p2.Spring){
        var i = this.springs.indexOf(obj);
        if(i!==-1){
            this.stage.removeChild(this.springSprites[i]);
            this.springSprites.splice(i,1);
        }
    }
};

WebGLRenderer.prototype.resize = function(w,h){
    this.renderer.resize(w, h);
};

})(p2);