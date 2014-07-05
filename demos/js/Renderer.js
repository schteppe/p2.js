// shim layer with setTimeout fallback
var requestAnimFrame =  window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        window.oRequestAnimationFrame      ||
                        window.msRequestAnimationFrame     ||
                        function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                        };

var disableSelectionCSS = [
    "-ms-user-select: none",
    "-moz-user-select: -moz-none",
    "-khtml-user-select: none",
    "-webkit-user-select: none",
    "user-select: none"
];

p2.Renderer = Renderer;

/**
 * Base class for rendering a p2 physics scene.
 * @class Renderer
 * @constructor
 * @param {World} world
 */
function Renderer(world){
    p2.EventEmitter.call(this);

    var that = this;

    this.world = world;
    this.initialState = world.toJSON();

    this.state = Renderer.DEFAULT;

    this.maxSubSteps = 3;

    // Bodies to draw
    this.bodies=[];
    this.springs=[];
    this.timeStep = 1/60;
    this.relaxation = p2.Equation.DEFAULT_RELAXATION;
    this.stiffness = p2.Equation.DEFAULT_STIFFNESS;

    this.mouseConstraint = null;
    this.nullBody = new p2.Body();
    this.pickPrecision = 5;

    this.useInterpolatedPositions = false;

    this.drawPoints = [];
    this.drawPointsChangeEvent = { type : "drawPointsChange" };
    this.drawCircleCenter = p2.vec2.create();
    this.drawCirclePoint = p2.vec2.create();
    this.drawCircleChangeEvent = { type : "drawCircleChange" };
    this.drawRectangleChangeEvent = { type : "drawRectangleChange" };
    this.drawRectStart = p2.vec2.create();
    this.drawRectEnd = p2.vec2.create();

    this.stateChangeEvent = { type : "stateChange", state:null };

    this.keydownEvent = {
        type:"keydown",
        originalEvent : null,
        keyCode : 0,
    };
    this.keyupEvent = {
        type:"keyup",
        originalEvent : null,
        keyCode : 0,
    };

    // Default collision masks for new shapes
    this.newShapeCollisionMask = 1;
    this.newShapeCollisionGroup = 1;

    // If constraints should be drawn
    this.drawConstraints = false;

    this.stats_sum = 0;
    this.stats_N = 100;
    this.stats_Nsummed = 0;
    this.stats_average = -1;

    var dpr = this.getDevicePixelRatio();
    this.w = window.innerWidth * dpr;
    this.h = window.innerHeight * dpr;

    this.settings = {
        tool: Renderer.DEFAULT,
        fullscreen: function(){
            var el = document.body;
            var requestFullscreen = el.requestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullscreen;
            if(requestFullscreen){
                requestFullscreen.call(el);
            }
        },

        'paused [p]': false,
        'manualStep [s]': function(){ world.step(world.lastTimeStep); },
        fps: 60,
        maxSubSteps: 3,
        gravityX: world.gravity[0],
        gravityY: world.gravity[1],
        bodySleeping: false,
        islandSleeping: false,

        'drawContacts [c]': false,
        'drawAABBs [t]': false,
        drawConstraints: false,

        iterations: world.solver.iterations,
        stiffness: 1000000,
        relaxation: 4,
        tolerance: 0.0001,
    };

    this.init();
    this.resize(this.w,this.h);
    this.render();
    this.createStats();
    this.addLogo();
    this.centerCamera(0, 0);

    var iter = -1;
    world.on("postStep",function(e){
        that.updateStats();

        // If the number of iterations changed - update the input value
        var solver = that.world.solver;
        if("subsolver" in solver)
            solver = solver.subsolver;
    }).on("addBody",function(e){
        that.addVisual(e.body);
    }).on("removeBody",function(e){
        that.removeVisual(e.body);
    }).on("addSpring",function(e){
        that.addVisual(e.spring);
    }).on("removeSpring",function(e){
        that.removeVisual(e.spring);
    });

    window.onresize = function(){
        var dpr = that.getDevicePixelRatio();
        that.resize(window.innerWidth * dpr, window.innerHeight * dpr);
    };

    this.setUpKeyboard();

    // Add initial bodies
    for(var i=0; i<world.bodies.length; i++){
        this.addVisual(world.bodies[i]);
    }
    for(var i=0; i<world.springs.length; i++){
        this.addVisual(world.springs[i]);
    }

    if(window.dat){
        var gui = this.gui = new dat.GUI();
        gui.domElement.setAttribute('style',disableSelectionCSS.join(';'));

        var settings = this.settings;

        gui.add(settings, 'tool', Renderer.toolStateMap).onChange(function(state){
            that.setState(parseInt(state));
        });
        gui.add(settings, 'fullscreen');

        // World folder
        var worldFolder = gui.addFolder('World');
        worldFolder.open();
        worldFolder.add(settings, 'paused [p]').onChange(function(p){
            that.paused = p;
        });
        worldFolder.add(settings, 'manualStep [s]');
        worldFolder.add(settings, 'fps', 60, 60*10).step(60).onChange(function(freq){
            that.timeStep = 1 / freq;
        });
        worldFolder.add(settings, 'maxSubSteps', 0, 10).step(1);
        var maxg = 100;

        function changeGravity(){
            if(!isNaN(settings.gravityX) && !isNaN(settings.gravityY)){
                p2.vec2.set(world.gravity, settings.gravityX, settings.gravityY);
            }
        }

        worldFolder.add(settings, 'gravityX', -maxg, maxg).onChange(changeGravity);
        worldFolder.add(settings, 'gravityY', -maxg, maxg).onChange(changeGravity);
        worldFolder.add(settings, 'bodySleeping').onChange(function(enable){
            world.enableBodySleeping = enable;
        });
        worldFolder.add(settings, 'islandSleeping').onChange(function(enable){
            world.enableIslandSleeping = enable;
        });

        // Render mode
        var renderingFolder = gui.addFolder('Rendering');
        renderingFolder.open();
        renderingFolder.add(settings,'drawContacts [c]').onChange(function(draw){
            that.drawContacts = draw;
        });
        renderingFolder.add(settings,'drawAABBs [t]').onChange(function(draw){
            that.drawAABBs = draw;
        });

        // Solver folder
        var solverFolder = gui.addFolder('Solver');
        solverFolder.open();
        solverFolder.add(settings, 'iterations', 1, 100).step(1).onChange(function(it){
            world.solver.iterations = it;
        });
        solverFolder.add(settings, 'stiffness', 10, 10000000).onChange(function(k){
            that.setEquationParameters();
        });
        solverFolder.add(settings, 'relaxation', 0, 20).step(0.1).onChange(function(d){
            that.setEquationParameters();
        });
        solverFolder.add(settings, 'tolerance', 0, 10).step(0.01).onChange(function(t){
            world.solver.tolerance = t;
        });

        // Scene picker
        sceneFolder = gui.addFolder('Scenes');
        sceneFolder.open();
    }

    this.run();
}
Renderer.prototype = new p2.EventEmitter();

Renderer.DEFAULT =            1;
Renderer.PANNING =            2;
Renderer.DRAGGING =           3;
Renderer.DRAWPOLYGON =        4;
Renderer.DRAWINGPOLYGON  =    5;
Renderer.DRAWCIRCLE =         6;
Renderer.DRAWINGCIRCLE  =     7;
Renderer.DRAWRECTANGLE =      8;
Renderer.DRAWINGRECTANGLE  =  9;

Renderer.toolStateMap = {
    'pick/pan [q]': Renderer.DEFAULT,
    'polygon [d]': Renderer.DRAWPOLYGON,
    'circle [a]': Renderer.DRAWCIRCLE,
    'rectangle [f]': Renderer.DRAWRECTANGLE
};
Renderer.stateToolMap = {};
for(var key in Renderer.toolStateMap){
    Renderer.stateToolMap[Renderer.toolStateMap[key]] = key;
}

Object.defineProperty(Renderer.prototype, 'drawContacts', {
    get: function() {
        return this.settings['drawContacts [c]'];
    },
    set: function(value) {
        this.settings['drawContacts [c]'] = value;
        this.updateGUI();
    }
});

Object.defineProperty(Renderer.prototype, 'drawAABBs', {
    get: function() {
        return this.settings['drawAABBs [t]'];
    },
    set: function(value) {
        this.settings['drawAABBs [t]'] = value;
        this.updateGUI();
    }
});

Renderer.prototype.getDevicePixelRatio = function() {
    return window.devicePixelRatio || 1;
};

/**
 * Updates dat.gui. Call whenever you change demo.settings.
 */
Renderer.prototype.updateGUI = function() {
    function updateControllers(folder){
        // First level
        for (var i in folder.__controllers){
            folder.__controllers[i].updateDisplay();
        }

        // Second level
        for (var f in folder.__folders){
            updateControllers(folder.__folders[f]);
        }
    }
    updateControllers(this.gui);
};

Renderer.elementClass = 'p2-canvas';
Renderer.containerClass = 'p2-container';

Renderer.prototype.setUpKeyboard = function() {
    var that = this;

    this.elementContainer.onkeydown = function(e){
        if(!e.keyCode){
            return;
        }
        var s = that.state;
        switch(String.fromCharCode(e.keyCode)){
        case "P": // pause
            that.settings['paused [p]'] = that.paused = !that.paused;
            break;
        case "S": // step
            that.world.step(that.world.lastTimeStep);
            break;
        case "R": // restart
            // TODO: use teardown &setup
            that.removeAllVisuals();
            var result = that.world.fromJSON(that.initialState);
            if(!result){
                console.warn("Not everything could be loaded from JSON!");
            }
            break;
        case "C": // toggle draw contacts & constraints
            that.drawContacts = !that.drawContacts;
            that.drawConstraints = !that.drawConstraints;
            break;
        case "T": // toggle draw AABBs
            that.drawAABBs = !that.drawAABBs;
            break;
        case "D": // toggle draw polygon mode
            that.setState(s === Renderer.DRAWPOLYGON ? Renderer.DEFAULT : s = Renderer.DRAWPOLYGON);
            break;
        case "A": // toggle draw circle mode
            that.setState(s === Renderer.DRAWCIRCLE ? Renderer.DEFAULT : s = Renderer.DRAWCIRCLE);
            break;
        case "F": // toggle draw rectangle mode
            that.setState(s === Renderer.DRAWRECTANGLE ? Renderer.DEFAULT : s = Renderer.DRAWRECTANGLE);
            break;
        case "Q": // set default
            that.setState(Renderer.DEFAULT);
            break;
        default:
            that.keydownEvent.keyCode = e.keyCode;
            that.keydownEvent.originalEvent = e;
            that.emit(that.keydownEvent);
            break;
        }
        that.updateGUI();
    };

    this.elementContainer.onkeyup = function(e){
        if(e.keyCode){
            switch(String.fromCharCode(e.keyCode)){
            default:
                that.keyupEvent.keyCode = e.keyCode;
                that.keyupEvent.originalEvent = e;
                that.emit(that.keyupEvent);
                break;
            }
        }
    };
};

Renderer.prototype.run = function(){
    var demo = this,
        lastCallTime = Date.now() / 1000;

    function update(){
        if(!demo.paused){
            var now = Date.now() / 1000,
                timeSinceLastCall = now-lastCallTime;
            lastCallTime = now;
            demo.world.step(demo.timeStep, timeSinceLastCall, demo.settings.maxSubSteps);
        }
        demo.render();
        requestAnimFrame(update);
    }
    requestAnimFrame(update);
};

Renderer.prototype.setState = function(s){
    this.state = s;
    this.stateChangeEvent.state = s;
    this.emit(this.stateChangeEvent);
    if(Renderer.stateToolMap[s]){
        this.settings.tool = s;
        this.updateGUI();
    }
};

/**
 * Should be called by subclasses whenever there's a mousedown event
 */
Renderer.prototype.handleMouseDown = function(physicsPosition){
    switch(this.state){

        case Renderer.DEFAULT:

            // Check if the clicked point overlaps bodies
            var result = this.world.hitTest(physicsPosition,world.bodies,this.pickPrecision);

            // Remove static bodies
            var b;
            while(result.length > 0){
                b = result.shift();
                if(b.type == p2.Body.STATIC)
                    b = null;
                else
                    break;
            }

            if(b){
                b.wakeUp();
                this.setState(Renderer.DRAGGING);
                // Add mouse joint to the body
                var localPoint = p2.vec2.create();
                b.toLocalFrame(localPoint,physicsPosition);
                this.world.addBody(this.nullBody);
                this.mouseConstraint = new p2.RevoluteConstraint(this.nullBody, b, {
                    localPivotA: physicsPosition,
                    localPivotB: localPoint
                });
                this.world.addConstraint(this.mouseConstraint);
            } else {
                this.setState(Renderer.PANNING);
            }
            break;

        case Renderer.DRAWPOLYGON:
            // Start drawing a polygon
            this.setState(Renderer.DRAWINGPOLYGON);
            this.drawPoints = [];
            var copy = p2.vec2.create();
            p2.vec2.copy(copy,physicsPosition);
            this.drawPoints.push(copy);
            this.emit(this.drawPointsChangeEvent);
            break;

        case Renderer.DRAWCIRCLE:
            // Start drawing a circle
            this.setState(Renderer.DRAWINGCIRCLE);
            p2.vec2.copy(this.drawCircleCenter,physicsPosition);
            p2.vec2.copy(this.drawCirclePoint, physicsPosition);
            this.emit(this.drawCircleChangeEvent);
            break;

        case Renderer.DRAWRECTANGLE:
            // Start drawing a circle
            this.setState(Renderer.DRAWINGRECTANGLE);
            p2.vec2.copy(this.drawRectStart,physicsPosition);
            p2.vec2.copy(this.drawRectEnd, physicsPosition);
            this.emit(this.drawRectangleChangeEvent);
            break;
    }
};

/**
 * Should be called by subclasses whenever there's a mousedown event
 */
Renderer.prototype.handleMouseMove = function(physicsPosition){
    var sampling = 0.4;
    switch(this.state){
        case Renderer.DEFAULT:
        case Renderer.DRAGGING:
            if(this.mouseConstraint){
                p2.vec2.copy(this.mouseConstraint.pivotA, physicsPosition);
                this.mouseConstraint.bodyA.wakeUp();
                this.mouseConstraint.bodyB.wakeUp();
            }
            break;

        case Renderer.DRAWINGPOLYGON:
            // drawing a polygon - add new point
            var sqdist = p2.vec2.dist(physicsPosition,this.drawPoints[this.drawPoints.length-1]);
            if(sqdist > sampling*sampling){
                var copy = [0,0];
                p2.vec2.copy(copy,physicsPosition);
                this.drawPoints.push(copy);
                this.emit(this.drawPointsChangeEvent);
            }
            break;

        case Renderer.DRAWINGCIRCLE:
            // drawing a circle - change the circle radius point to current
            p2.vec2.copy(this.drawCirclePoint, physicsPosition);
            this.emit(this.drawCircleChangeEvent);
            break;

        case Renderer.DRAWINGRECTANGLE:
            // drawing a rectangle - change the end point to current
            p2.vec2.copy(this.drawRectEnd, physicsPosition);
            this.emit(this.drawRectangleChangeEvent);
            break;
    }
};

/**
 * Should be called by subclasses whenever there's a mouseup event
 */
Renderer.prototype.handleMouseUp = function(physicsPosition){

    var b;

    switch(this.state){

        case Renderer.DEFAULT:
            break;

        case Renderer.DRAGGING:
            // Drop constraint
            this.world.removeConstraint(this.mouseConstraint);
            this.mouseConstraint = null;
            this.world.removeBody(this.nullBody);

        case Renderer.PANNING:
            this.setState(Renderer.DEFAULT);
            break;

        case Renderer.DRAWINGPOLYGON:
            // End this drawing state
            this.setState(Renderer.DRAWPOLYGON);
            if(this.drawPoints.length > 3){
                // Create polygon
                b = new p2.Body({ mass : 1 });
                if(b.fromPolygon(this.drawPoints,{
                    removeCollinearPoints : 0.01,
                })){
                    this.world.addBody(b);
                }
            }
            this.drawPoints = [];
            this.emit(this.drawPointsChangeEvent);
            break;

        case Renderer.DRAWINGCIRCLE:
            // End this drawing state
            this.setState(Renderer.DRAWCIRCLE);
            var R = p2.vec2.dist(this.drawCircleCenter,this.drawCirclePoint);
            if(R > 0){
                // Create circle
                b = new p2.Body({ mass : 1, position : this.drawCircleCenter });
                var circle = new p2.Circle(R);
                b.addShape(circle);
                this.world.addBody(b);
            }
            p2.vec2.copy(this.drawCircleCenter,this.drawCirclePoint);
            this.emit(this.drawCircleChangeEvent);
            break;

        case Renderer.DRAWINGRECTANGLE:
            // End this drawing state
            this.setState(Renderer.DRAWRECTANGLE);
            // Make sure first point is upper left
            var start = this.drawRectStart;
            var end = this.drawRectEnd;
            for(var i=0; i<2; i++){
                if(start[i] > end[i]){
                    var tmp = end[i];
                    end[i] = start[i];
                    start[i] = tmp;
                }
            }
            var width = Math.abs(start[0] - end[0]);
            var height = Math.abs(start[1] - end[1]);
            if(width > 0 && height > 0){
                // Create box
                b = new p2.Body({
                    mass : 1,
                    position : [this.drawRectStart[0] + width*0.5, this.drawRectStart[1] + height*0.5]
                });
                var rectangleShape = new p2.Rectangle(width, height);
                b.addShape(rectangleShape);
                this.world.addBody(b);
            }
            p2.vec2.copy(this.drawRectEnd,this.drawRectStart);
            this.emit(this.drawRectangleChangeEvent);
            break;
    }

    if(b){
        b.wakeUp();
        for(var i=0; i<b.shapes.length; i++){
            var s = b.shapes[i];
            s.collisionMask =  this.newShapeCollisionMask;
            s.collisionGroup = this.newShapeCollisionGroup;
        }
    }
};

/**
 * Update stats
 */
Renderer.prototype.updateStats = function(){
    this.stats_sum += this.world.lastStepTime;
    this.stats_Nsummed++;
    if(this.stats_Nsummed == this.stats_N){
        this.stats_average = this.stats_sum/this.stats_N;
        this.stats_sum = 0.0;
        this.stats_Nsummed = 0;
    }
    /*
    this.stats_stepdiv.innerHTML = "Physics step: "+(Math.round(this.stats_average*100)/100)+"ms";
    this.stats_contactsdiv.innerHTML = "Contacts: "+this.world.narrowphase.contactEquations.length;
    */
};

/**
 * Add an object to the demo
 * @param  {mixed} obj Either Body or Spring
 */
Renderer.prototype.addVisual = function(obj){
    if(obj instanceof p2.Spring){
        this.springs.push(obj);
        this.addRenderable(obj);
    } else if(obj instanceof p2.Body){
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
Renderer.prototype.removeAllVisuals = function(){
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
Renderer.prototype.removeVisual = function(obj){
    this.removeRenderable(obj);
    if(obj instanceof p2.Spring){
        var idx = this.springs.indexOf(obj);
        if(idx != -1)
            this.springs.splice(idx,1);
    } else if(obj instanceof p2.Body){
        var idx = this.bodies.indexOf(obj);
        if(idx != -1)
            this.bodies.splice(idx,1);
    } else {
        console.error("Visual type not recognized...");
    }
};

/**
 * Create the container/divs for stats
 * @todo  integrate in new menu
 */
Renderer.prototype.createStats = function(){
    /*
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
    */
};

Renderer.prototype.addLogo = function(){
    var css = [
        'position:absolute',
        'left:10px',
        'top:15px',
        'text-align:center',
        'font: 13px Helvetica, arial, freesans, clean, sans-serif',
    ].concat(disableSelectionCSS);

    var div = document.createElement('div');
    div.innerHTML = [
        "<div style='"+css.join(';')+"' user-select='none'>",
        "<h1 style='margin:0px'><a href='http://github.com/schteppe/p2.js' style='color:black; text-decoration:none;'>p2.js</a></h1>",
        "<p style='margin:5px'>Physics Engine</p>",
        '<a style="color:black; text-decoration:none;" href="https://twitter.com/share" class="twitter-share-button" data-via="schteppe" data-count="none" data-hashtags="p2js">Tweet</a>',
        "</div>"
    ].join("");
    this.elementContainer.appendChild(div);

    // Twitter button script
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
};

Renderer.zoomInEvent = {
    type:"zoomin"
};
Renderer.zoomOutEvent = {
    type:"zoomout"
};

Renderer.prototype.setEquationParameters = function(){
    this.world.setGlobalEquationParameters({
        stiffness: this.settings.stiffness,
        relaxation: this.settings.relaxation
    });
};
