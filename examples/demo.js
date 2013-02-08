var demo = {};

demo.timeStep = 1/60;

demo.createScene = function(createSceneFunc){

    // View box stuff
    // Todo: auto scale to scene size
    var vBoxScale = 50;
    var vBoxX = 0;
    var vBoxY = 0;

    function toScreenX(x){
        return vBoxX + x*vBoxScale;
    }
    function toScreenY(y){
        return vBoxY + window.innerHeight - y*vBoxScale;
    }
    function toScreenScale(num){
        return num * vBoxScale;
    }

    // shim layer with setTimeout fallback
    var requestAnimFrame = window.requestAnimationFrame       || 
                           window.webkitRequestAnimationFrame || 
                           window.mozRequestAnimationFrame    || 
                           window.oRequestAnimationFrame      || 
                           window.msRequestAnimationFrame     || 
                           function( callback ){
                                window.setTimeout(callback, 1000 / 60);
                           };

    var canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var world = new Spring2D.World();
    createSceneFunc(world);

    // Draws a circle.
    function drawCircle(context,cx,cy,radius){
        context.beginPath();
        context.arc(cx, cy, radius, 0, 2 * Math.PI, false);
        context.stroke();
        context.fill();
    }

    // Draws a spring.
    function drawSpring(context,x1,y1,x2,y2,restLength){
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
        for(var i=0; i<M; i++){
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
    }

    // Renders the world
    function render(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Render springs
        for(var i=0,Nsprings=world.springs.length; i!==Nsprings; i++){
            var s = world.springs[i];
            var x1 = toScreenX(s.bodyA.position.x);
            var y1 = toScreenY(s.bodyA.position.y);
            var x2 = toScreenX(s.bodyB.position.x);
            var y2 = toScreenY(s.bodyB.position.y);
            drawSpring(ctx,x1,y1,x2,y2,toScreenScale(s.restLength));
        }

        // Render bodies
        for(var i=0,Nbodies=world.bodies.length; i!==Nbodies; i++){
            var b = world.bodies[i];
            var x = toScreenX(b.position.x);
            var y = toScreenY(b.position.y);
            if(b.shape instanceof(Spring2D.Circle)){
                drawCircle(ctx,x,y,toScreenScale(b.shape.radius));
            } else if(b.shape instanceof(Spring2D.Circle)){
                drawCircle(ctx,x,y,3);
            }
        }
    }

    // Start rendering
    (function animloop(){
        requestAnimFrame(animloop);
        render();
        world.step(1/60);
    })();
};