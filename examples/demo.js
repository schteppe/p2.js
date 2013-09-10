
// shim layer with setTimeout fallback
var requestAnimFrame = window.requestAnimationFrame       ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame    ||
                       window.oRequestAnimationFrame      ||
                       window.msRequestAnimationFrame     ||
                       function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                       };

var vec2 = p2.vec2;

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
        springSprites=[],
        stage;

    w = $(window).width();
    h = $(window).height();

    this.createScene = function(createFunc){
        createFunc(that.world);
        init();
    };

    function drawCircle(g,x,y,radius,color,lineWidth){
        lineWidth = lineWidth || 1;
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

    function drawSpring(g,restLength,color,lineWidth){
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

    }

    function init(){

        renderer = PIXI.autoDetectRenderer(w, h);
        stage = new PIXI.DisplayObjectContainer();
        container = new PIXI.Stage(0xFFFFFF,true);

        document.body.appendChild(renderer.view);

        for(var i=0; i<that.bodies.length; i++){
            var radiusPixels = that.bodies[i].shape.radius * pixelsPerLengthUnit;
            var sprite = new PIXI.Graphics();
            drawCircle(sprite,0,0,radiusPixels,0xFFFFFF,2);
            stage.addChild(sprite);
            sprites.push(sprite);
        }

        for(var i=0; i<that.springs.length; i++){
            var restLengthPixels = that.springs[i].restLength * pixelsPerLengthUnit;
            var sprite = new PIXI.Graphics();
            drawSpring(sprite,restLengthPixels,0x000000,1);
            stage.addChild(sprite);
            springSprites.push(sprite);
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

    var X = vec2.fromValues(1,0);
    var distVec = vec2.fromValues(0,0);
    function render(){

        // Update body transforms
        for(var i=0; i<that.bodies.length; i++){
            var b = that.bodies[i],
                s = sprites[i];
            s.position.x = w - b.position[0] * pixelsPerLengthUnit;
            s.position.y = h - b.position[1] * pixelsPerLengthUnit;
            s.rotation = b.angle;
        }

        // Update spring transforms
        for(var i=0; i<that.springs.length; i++){
            var s = that.springs[i],
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
        stage.updateTransform();
    });
}
