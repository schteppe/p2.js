
// shim layer with setTimeout fallback
var requestAnimFrame = window.requestAnimationFrame       || 
                       window.webkitRequestAnimationFrame || 
                       window.mozRequestAnimationFrame    || 
                       window.oRequestAnimationFrame      || 
                       window.msRequestAnimationFrame     || 
                       function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                       };

function Demo(world){
    var that = this;
    this.bodies=[];
    this.springs=[];
    this.paused = false;
    this.timeStep = 1/60;
    this.addVisual = function(body){
        var buf, s=body.shape;
        if(s instanceof p2.Circle){
            that.bodies.push(body);
        } else if(body instanceof p2.Spring){
            that.springs.push(body);
        }
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
    var average = "???";
    this.updateStats = function(){
        sum += world.lastStepTime;
        Nsummed++;
        if(Nsummed == N){
            average = sum/N;
            sum = 0.0;
            Nsummed = 0;
        }
        document.getElementById("step").innerHTML = "Physics step: "+average+"ms";
        document.getElementById("vecs").innerHTML = "Vec create: "+world.vecCreations;
        document.getElementById("mats").innerHTML = "Mat create: "+world.matCreations;
        document.getElementById("contacts").innerHTML = "Contacts: "+world.contacts.length;
    }
}

function WebGLDemo(){
    var world = new p2.World();
    Demo.call(this,world);
    var that = this;

    var sin=Math.sin, cos=Math.cos, world;
    var camera, scene, renderer, geometry, material, meshes=[], radius;

    this.createScene = function(createFunc) {
        createFunc(world);
        init();
        animate();
    };

    function createCircleGeo(radius,Nsegments){
        // Circle geo
        var circleGeometry = new THREE.Geometry(200,200,200);
        var N = Nsegments||10;
        var sectorAngle = 2*Math.PI/N;
        var vCenter = new THREE.Vector3(0,0,0);
        var vTop = new THREE.Vector3(0,radius,0);
        circleGeometry.vertices.push(vCenter);
        circleGeometry.vertices.push(vTop);
        for(var i=0; i<=N; i++){

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
        var redMat = new THREE.MeshBasicMaterial({color: 0xff0000});            

        // Create meshes for all
        var circleGeometry = createCircleGeo(that.bodies[0].shape.radius);
        for(var i=0; i<that.bodies.length; i++){
            meshes.push(new THREE.Mesh(circleGeometry, redMat));
            scene.add(meshes[i]);
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

        world.step(that.timeStep);
        for(var i=0, Nc=meshes.length; i!==Nc; i++){
            var p = meshes[i].position;
            p.x = V.getX(that.bodies[i].position);
            p.y = V.getY(that.bodies[i].position);
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
                var x1 = toScreenX(V.getX(s.bodyA.position));
                var y1 = toScreenY(V.getY(s.bodyA.position));
                var x2 = toScreenX(V.getX(s.bodyB.position));
                var y2 = toScreenY(V.getY(s.bodyB.position));
                drawSpring(ctx,x1,y1,x2,y2,toScreenScale(s.restLength));
            }

            // Render bodies
            for(var i=0,Nbodies=bodies.length; i!==Nbodies; i++){
                var b = bodies[i];
                var x = toScreenX(V.getX(b.position));
                var y = toScreenY(V.getY(b.position));
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

        document.addEventListener('keypress',function(e){
            if(e.keyCode){
                switch(e.keyCode){
                    case 112: // p
                    that.paused = !that.paused;
                    break;

                    case 115: // s
                    if(that.paused){
                        tick();
                    }
                    break;
                }
            }
        });

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
