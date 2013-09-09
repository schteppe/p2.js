
// shim layer with setTimeout fallback
var requestAnimFrame = window.requestAnimationFrame       ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame    ||
                       window.oRequestAnimationFrame      ||
                       window.msRequestAnimationFrame     ||
                       function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                       };

function Demo(){
    var world = this.world = new p2.World({ doProfiling: true });
    var that = this;
    this.bodies=[];
    this.springs=[];
    this.paused = false;
    this.timeStep = 1/60;
    this.addVisual = function(body){
        var buf, s=body.shape;
        if(body instanceof p2.Spring){
            that.springs.push(body);
        } else
            that.bodies.push(body);
    };
    this.createStats = function(){
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
    };

    var sum = 0;
    var N = 100;
    var Nsummed = 0;
    var average = -1;
    this.updateStats = function(){
        sum += world.lastStepTime;
        Nsummed++;
        if(Nsummed == N){
            average = sum/N;
            sum = 0.0;
            Nsummed = 0;
        }
        document.getElementById("step").innerHTML = "Physics step: "+(Math.round(average*100)/100)+"ms";
        document.getElementById("contacts").innerHTML = "Contacts: "+world.contacts.length;
    }

    document.addEventListener('keypress',function(e){
        if(e.keyCode){
            switch(e.keyCode){
                case 112: // p
                that.paused = !that.paused;
                break;
            }
        }
    });
}

function PixiDemo(){
    Demo.call(this);
    var world = this.world;

    var pixelsPerLengthUnit = 128;

    var that = this,
        w,h,
        container,
        renderer,
        sprites=[],
        stage;

    w = $(window).width();
    h = $(window).height();

    this.createScene = function(createFunc){
        createFunc(that.world);
        init();
    };

    function drawCircle(g,x,y,radius,color,lineWidth){
        lineWidth = lineWidth || defaultLineWidth;
        color = color || 0xffffff;
        g.lineStyle(lineWidth, 0x000000, 1);
        g.beginFill(color, 1.0);
        g.drawCircle(0, 0, radius);
        g.endFill();

        // Dashed line from center to edge
        /*var Ndashes = 4;
        for(var j=0; j<Ndashes; j++){
            g.moveTo(0,-j/Ndashes*radius);
            g.lineTo(0,-(j+0.5)/Ndashes*radius);
        }*/
    }

    function init(){

        renderer = PIXI.autoDetectRenderer(w, h);
        stage = new PIXI.DisplayObjectContainer();
        container = new PIXI.Stage(0xFFFFFF,true);

        document.body.appendChild(renderer.view);

        var cachedCircleTextures = {};
        for(var i=0; i<that.bodies.length; i++){
            //var ballTexture;
            var radiusPixels = that.bodies[i].shape.radius * pixelsPerLengthUnit;
            var sprite = new PIXI.Graphics();
            drawCircle(sprite,0,0,radiusPixels,0xFFFFFF,2);
            stage.addChild(sprite);
            sprites.push(sprite);
        }

        container.addChild(stage);
        stage.position.x = -w/2; // center at origin
        stage.position.y = -h/2;

        that.createStats();

        resize();
        requestAnimFrame(update);
    }

    function resize(){
        w = $(window).width();
        h = $(window).height();
        renderer.resize(w, h);
    }

    function update(){
        if(!that.paused){
            world.step(that.timeStep);
        }

        render();
        that.updateStats();
    }

    function render(){
        for(var i=0; i<that.bodies.length; i++){
            var b = that.bodies[i],
                s = sprites[i];
            s.position.x = w - b.position[0] * pixelsPerLengthUnit;
            s.position.y = h - b.position[1] * pixelsPerLengthUnit;
            s.rotation = b.angle;
        }
        renderer.render(container);
        requestAnimFrame(update);
    }

    var lastX, lastY, startX, startY, down=false;
    $(document).mousedown(function(e){
        lastX = e.clientX;
        lastY = e.clientY;
        startX = stage.position.x;
        startY = stage.position.y;
        down = true;
    }).mousemove(function(e){
        if(down){
            stage.position.x = e.clientX-lastX+startX;
            stage.position.y = e.clientY-lastY+startY;
        }
    }).mouseup(function(e){
        down = false;
    });

    var scrollFactor = 0.1;
    $(window).bind('mousewheel', function(e){
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
    });
}

function WebGLDemo(){
    Demo.apply(this);

    var that = this;

    var world = that.world;
    var sin=Math.sin, cos=Math.cos, world;
    var camera, scene, renderer, geometry, material, meshes=[], radius;

    this.createScene = function(createFunc) {
        createFunc(world);
        init();
        animate();
    };

    function createCircleGeo(radius,Nsegments,NfillSegments){
        // Circle geo
        var circleGeometry = new THREE.Geometry(200,200,200);
        var N = Nsegments||20;
        var sectorAngle = 2*Math.PI/N;
        var vCenter = new THREE.Vector3(0,0,0);
        var vTop = new THREE.Vector3(0,radius,0);
        circleGeometry.vertices.push(vCenter);
        circleGeometry.vertices.push(vTop);

        NfillSegments = NfillSegments||N;

        for(var i=0; i<=NfillSegments; i++){

            var v1 = new THREE.Vector3( radius*Math.cos(i*sectorAngle),
                                        radius*Math.sin(i*sectorAngle),
                                        0);

            // Push vertices represented by position vectors
            circleGeometry.vertices.push(v1);

            // Push face, defined with vertices in counter clock-wise order
            circleGeometry.faces.push(new THREE.Face3(0, i+1, i+2));
        }
        return circleGeometry;
    }


    function init(){
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(3,0,20);
        scene.add(camera);

        // Create a material and combine with geometry to create our mesh
        var redMat = new THREE.MeshBasicMaterial({color: 0xff3333});
        var blackMat = new THREE.MeshBasicMaterial({color: 0x000000});

        // Create meshes for all
        var Nseg = 30;
        for(var i=0; i<that.bodies.length; i++){
            var circleGeometryInner = createCircleGeo(that.bodies[i].shape.radius*0.9, Nseg, Nseg-1);
            var circleGeometryOuter = createCircleGeo(that.bodies[i].shape.radius,     Nseg);
            var obj = new THREE.Object3D();
            var meshOuter = new THREE.Mesh(circleGeometryOuter, blackMat);
            var meshInner = new THREE.Mesh(circleGeometryInner, redMat);
            obj.add(meshOuter);
            obj.add(meshInner);
            meshes.push(obj);
            scene.add(obj);
        }

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        that.createStats();

        function zoom(delta){
            camera.position.z += delta * camera.position.z*0.05;
        }
        function pan(dx,dy){
            camera.position.x -= dx * camera.position.z*0.001;
            camera.position.y += dy * camera.position.z*0.001;
        }

        var handleScroll = function(evt){
            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
            if (delta) zoom(delta);
            return evt.preventDefault() && false;
        };
        renderer.domElement.addEventListener('DOMMouseScroll',handleScroll,false);
        renderer.domElement.addEventListener('mousewheel',handleScroll,false);

        var canvas = renderer.domElement;


        var lastX=canvas.width/2, lastY=canvas.height/2;
        var dragStartX, dragStartY, dragged;
        canvas.addEventListener('mousedown',function(evt){
            document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            lastX = evt.offsetX;
            lastY = evt.offsetY;
            dragStartX = evt.clientX;
            dragStartY = evt.clientY;
            dragged = false;
        },false);
        canvas.addEventListener('mousemove',function(evt){
            dragged = true;
            if (dragStartX){
                pan(evt.clientX-lastX,evt.clientY-lastY);
                render();
            }
            lastX = evt.offsetX;
            lastY = evt.offsetY;
        },false);
        canvas.addEventListener('mouseup',function(evt){
            dragStartX = null;
            dragStartY = null;
            lastX = evt.offsetX;
            lastY = evt.offsetY;
            if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
        },false);

    }

    var V = p2.V;
    var t=0;
    function animate() {
        requestAnimFrame(animate);

        if(!that.paused) world.step(that.timeStep);
        for(var i=0, Nc=meshes.length; i!==Nc; i++){
            var p = meshes[i].position;
            var r = meshes[i].rotation;
            p.x = that.bodies[i].position[0];
            p.y = that.bodies[i].position[1];
            r.z = that.bodies[i].angle;
        }
        t++;

        render();
        that.updateStats();
    }

    function render() {
        renderer.render(scene, camera);
    }
}
WebGLDemo.prototype = new Demo();

function CanvasDemo(){
    var world = new p2.World();
    Demo.call(this,world);
    var that = this;

    // View box stuff
    // Todo: auto scale to scene size
    var vBoxScale = 50;
    var vBoxX = 0;
    var vBoxY = 0;

    var bodies = this.bodies;
    var springs = this.springs;
    var buffers = []; // canvas buffers for each body

    var V = p2.V;

    function toScreenX(x){
        return vBoxX + x*vBoxScale;
    }
    function toScreenY(y){
        return vBoxY + window.innerHeight - y*vBoxScale;
    }
    function toScreenScale(num){
        return num * vBoxScale;
    }

    // Draws a circle.
    function drawCircle(ctx,cx,cy,radius){
        //ctx.fillStyle = "red";
        //ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
        ctx.fill();

        //ctx.moveTo(cx+radius,cy);
        //ctx.lineTo(cx,cy);
        ctx.closePath();
        //ctx.stroke();
    }

    // Draws a spring.
    function drawSpring(context,x1,y1,x2,y2,restLength,zigZag){
        context.beginPath();
        var l = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        var nx = (x2-x1) / l;
        var ny = (y2-y1) / l;
        var tx = -ny * restLength*0.04;
        var ty = nx * restLength*0.04;
        var M = 20;
        var dx = l*nx/M;
        var dy = l*ny/M;
        context.moveTo(x1, y1);
        for(var i=0; zigZag && i!==M; i++){
            var x = x1 + dx*i;
            var y = y1 + dy*i;
            if(i<=1 || i>=M-1 ){
                // Do nothing
            } else if(i % 2 == 0){
                x -= tx;
                y -= ty;
            } else {
                x += tx;
                y += ty;
            }
            context.lineTo(x,y);
        }
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }

    var buffers = [];

    function renderToCanvas(width, height, renderFunction) {
        var buffer = document.createElement('canvas');
        buffer.width = parseInt(width);
        buffer.height = parseInt(height);
        renderFunction(buffer.getContext('2d'));
        return buffer;
    };

    this.createScene = function(createSceneFunc){

        that.createStats();

        var canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        trackTransforms(ctx);

        createSceneFunc(world);

        // Renders the world
        function render(){

            //ctx.clearRect(0,0,canvas.width,canvas.height);

            // Clear the entire canvas
            var p = ctx.transformedPoint(0,0);
            var q = ctx.transformedPoint(canvas.width,canvas.height);
            ctx.clearRect(p.x,p.y,q.x-p.x,q.y-p.y);

            // Render springs
            for(var i=0,Nsprings=springs.length; i!==Nsprings; i++){
                var s = springs[i];
                var x1 = toScreenX(s.bodyA.position[0]);
                var y1 = toScreenY(s.bodyA.position[1]);
                var x2 = toScreenX(s.bodyB.position[0]);
                var y2 = toScreenY(s.bodyB.position[1]);
                drawSpring(ctx,x1,y1,x2,y2,toScreenScale(s.restLength));
            }

            // Render bodies
            for(var i=0,Nbodies=bodies.length; i!==Nbodies; i++){
                var b = bodies[i];
                var x = toScreenX(b.position[0]);
                var y = toScreenY(b.position[1]);
                if(b.shape instanceof(p2.Circle)){
                    drawCircle(ctx,x,y,toScreenScale(b.shape.radius));
                } else if(b.shape instanceof(p2.Particle)){
                    drawCircle(ctx,x,y,3);
                }
            }
        }

        function tick(){
            world.step(that.timeStep);
            that.updateStats();
            render();
        }

        // Start rendering
        (function animloop(){
            requestAnimFrame(animloop);
            if(!that.paused) tick();
        })();

        var lastX=canvas.width/2, lastY=canvas.height/2;
        var dragStart,dragged;
        canvas.addEventListener('mousedown',function(evt){
            document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            dragStart = ctx.transformedPoint(lastX,lastY);
            dragged = false;
        },false);
        canvas.addEventListener('mousemove',function(evt){
            lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            dragged = true;
            if (dragStart){
                var pt = ctx.transformedPoint(lastX,lastY);
                ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
                render();
            }
        },false);
        canvas.addEventListener('mouseup',function(evt){
            dragStart = null;
            if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
        },false);

        var scaleFactor = 1.1;
        var zoom = function(clicks){
            var pt = ctx.transformedPoint(lastX,lastY);
            ctx.translate(pt.x,pt.y);
            var factor = Math.pow(scaleFactor,clicks);
            ctx.scale(factor,factor);
            ctx.translate(-pt.x,-pt.y);
            render();
        }

        var handleScroll = function(evt){
            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
            if (delta) zoom(delta);
            return evt.preventDefault() && false;
        };
        canvas.addEventListener('DOMMouseScroll',handleScroll,false);
        canvas.addEventListener('mousewheel',handleScroll,false);
    };

    // Adds ctx.getTransform() - returns an SVGMatrix
    // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
    function trackTransforms(ctx){
        var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };

        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        var translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        var transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    }
}
WebGLDemo.prototype = new Demo();
