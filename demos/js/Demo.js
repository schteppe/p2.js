(function($){
    $.fn.disableSelection = function() {
        return this
                 .attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .on('selectstart', false);
    };
})(jQuery);

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
    p2.EventEmitter.call(this);

    var that = this;

    this.world = world;
    //var serializer = this.serializer = new p2extras.Serializer();
    this.initialState = world.toJSON();//serializer.serialize(world);

    this.state = Demo.DEFAULT;

    this.maxSubSteps = 3;

    this.bodies=[];
    this.springs=[];
    this.paused = false;
    this.timeStep = 1/60;
    this.relaxation = p2.Equation.DEFAULT_RELAXATION;
    this.stiffness = p2.Equation.DEFAULT_STIFFNESS;

    this.mouseConstraint = null;
    this.nullBody = new p2.Body();
    this.pickPrecision = 5;

    this.drawPoints = [];
    this.drawPointsChangeEvent = { type : "drawPointsChange" };
    this.drawCircleCenter = p2.vec2.create();
    this.drawCirclePoint = p2.vec2.create();
    this.drawCircleChangeEvent = { type : "drawCircleChange" };

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

    // If contacts should be drawn
    this.drawContacts = false;

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
    this.createMenu();

    var iter = -1;
    world.on("postStep",function(e){
        that.updateStats();

        // If the number of iterations changed - update the input value
        var solver = that.world.solver;
        if("subsolver" in solver)
            solver = solver.subsolver;
        if(iter != solver.iterations){
            $("#menu-solver-iterations").val(solver.iterations);
            iter = solver.iterations;
        }
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

    $(document).keydown(function(e){
        if(e.keyCode){
            var s = that.state;
            switch(String.fromCharCode(e.keyCode)){
                case "P": // pause
                    that.paused = !that.paused;
                    break;
                case "S": // step
                    that.world.step(that.world.lastTimeStep);
                    break;
                case "R": // restart
                    that.removeAllVisuals();
                    var result = that.world.fromJSON(that.initialState);
                    if(!result) console.warn("Not everything could be loaded from JSON!");
                    /*var result = that.serializer.deserialize(that.initialState,that.world,p2);
                    if(!result)
                        console.error(that.serializer.error,that.serializer.validateResult);*/
                    break;
                case "C": // toggle draw contacts
                    that.drawContacts = !that.drawContacts;
                    break;
                case "D": // toggle draw polygon mode
                    that.setState(s == Demo.DRAWPOLYGON ? Demo.DEFAULT : s = Demo.DRAWPOLYGON);
                    break;
                case "A": // toggle draw circle mode
                    that.setState(s == Demo.DRAWCIRCLE ? Demo.DEFAULT : s = Demo.DRAWCIRCLE);
                    break;
                default:
                    that.keydownEvent.keyCode = e.keyCode;
                    that.keydownEvent.originalEvent = e;
                    that.emit(that.keydownEvent);
                    break;
            }
        }
    }).keyup(function(e){
        if(e.keyCode){
            switch(String.fromCharCode(e.keyCode)){
                default:
                    that.keyupEvent.keyCode = e.keyCode;
                    that.keyupEvent.originalEvent = e;
                    that.emit(that.keyupEvent);
                    break;
            }
        }
    });

    // Add initial bodies
    for(var i=0; i<world.bodies.length; i++)
        this.addVisual(world.bodies[i]);
    for(var i=0; i<world.springs.length; i++)
        this.addVisual(world.springs[i]);

    this.on("stateChange",function(e){
        that.updateTools();
    });
    this.updateTools();
    this.run();
}
Demo.prototype = new p2.EventEmitter();

Demo.DEFAULT =            1;
Demo.PANNING =            2;
Demo.DRAGGING =           3;
Demo.DRAWPOLYGON =        4;
Demo.DRAWINGPOLYGON  =    5;
Demo.DRAWCIRCLE =         6;
Demo.DRAWINGCIRCLE  =     7;

Demo.prototype.run = function(){
    var demo = this,
        lastCallTime = Date.now() / 1000;

    function update(){
        if(!demo.paused){
            var now = Date.now() / 1000,
                timeSinceLastCall = now-lastCallTime;
            lastCallTime = now;
            demo.world.step(demo.timeStep,timeSinceLastCall,demo.maxSubSteps);
        }
        demo.render();
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
};

Demo.prototype.setState = function(s){
    this.state = s;
    this.stateChangeEvent.state = s;
    this.emit(this.stateChangeEvent);
};

/**
 * Should be called by subclasses whenever there's a mousedown event
 */
Demo.prototype.handleMouseDown = function(physicsPosition){
    switch(this.state){

        case Demo.DEFAULT:

            // Check if the clicked point overlaps bodies
            var result = this.world.hitTest(physicsPosition,world.bodies,this.pickPrecision);

            // Remove static bodies
            var b;
            while(result.length > 0){
                b = result.shift();
                if(b.motionState == p2.Body.STATIC)
                    b = null;
                else
                    break;
            }

            if(b){
                b.wakeUp();
                this.setState(Demo.DRAGGING);
                // Add mouse joint to the body
                var localPoint = p2.vec2.create();
                b.toLocalFrame(localPoint,physicsPosition);
                this.world.addBody(this.nullBody);
                this.mouseConstraint = new p2.RevoluteConstraint(  this.nullBody, physicsPosition,
                                                                    b,             localPoint);
                this.world.addConstraint(this.mouseConstraint);
            } else {
                this.setState(Demo.PANNING);
            }
            break;

        case Demo.DRAWPOLYGON:
            // Start drawing a polygon
            this.setState(Demo.DRAWINGPOLYGON);
            this.drawPoints = [];
            var copy = p2.vec2.create();
            p2.vec2.copy(copy,physicsPosition);
            this.drawPoints.push(copy);
            this.emit(this.drawPointsChangeEvent);
            break;

        case Demo.DRAWCIRCLE:
            // Start drawing a circle
            this.setState(Demo.DRAWINGCIRCLE);
            p2.vec2.copy(this.drawCircleCenter,physicsPosition);
            p2.vec2.copy(this.drawCirclePoint, physicsPosition);
            this.emit(this.drawCircleChangeEvent);
            break;
    }
};

/**
 * Should be called by subclasses whenever there's a mousedown event
 */
Demo.prototype.handleMouseMove = function(physicsPosition){
    var sampling = 0.4;
    switch(this.state){
        case Demo.DEFAULT:
        case Demo.DRAGGING:
            if(this.mouseConstraint){
                this.mouseConstraint.bodyA.wakeUp();
                this.mouseConstraint.bodyB.wakeUp();
            }
            break;

        case Demo.DRAWINGPOLYGON:
            // drawing a polygon - add new point
            var sqdist = p2.vec2.dist(physicsPosition,this.drawPoints[this.drawPoints.length-1]);
            if(sqdist > sampling*sampling){
                var copy = [0,0];
                p2.vec2.copy(copy,physicsPosition);
                this.drawPoints.push(copy);
                this.emit(this.drawPointsChangeEvent);
            }
            break;

        case Demo.DRAWINGCIRCLE:
            // drawing a circle - change the circle radius point to current
            p2.vec2.copy(this.drawCirclePoint, physicsPosition);
            this.emit(this.drawCircleChangeEvent);
            break;
    }
};

/**
 * Should be called by subclasses whenever there's a mouseup event
 */
Demo.prototype.handleMouseUp = function(physicsPosition){

    var b;

    switch(this.state){

        case Demo.DEFAULT:
            break;

        case Demo.DRAGGING:
            // Drop constraint
            this.world.removeConstraint(this.mouseConstraint);
            this.mouseConstraint = null;
            this.world.removeBody(this.nullBody);

        case Demo.PANNING:
            this.setState(Demo.DEFAULT);
            break;

        case Demo.DRAWINGPOLYGON:
            // End this drawing state
            this.setState(Demo.DRAWPOLYGON);
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

        case Demo.DRAWINGCIRCLE:
            // End this drawing state
            this.setState(Demo.DRAWCIRCLE);
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
Demo.prototype.updateStats = function(){
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
Demo.prototype.addVisual = function(obj){
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
Demo.prototype.createStats = function(){
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

Demo.prototype.createMenu = function(){
    var that = this,
        playHtml = "<b class='icon-play'></b>",
        pauseHtml = "<b class='icon-pause'></b>";

    // Insert logo
    $("body").append($([
        "<div id='logo'>",
        "<h1><a href='http://github.com/schteppe/p2.js'>p2.js</a></h1>",
        "<p>Physics Engine</p>",
        '<a href="https://twitter.com/share" class="twitter-share-button" data-via="schteppe" data-count="none" data-hashtags="p2js">Tweet</a>',
        "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>",
        "</div>"].join("")).disableSelection());

    // Get title
    var title = "Untitled demo";
    $title = $(document).find("title");
    if($title)
        title = $title.text();
    title = title
        .replace(/\s\-\s.*$/,"")
        .replace(/\s+demo$/,"");

    // Get description
    var description = "";
    $desc = $("meta[name=description]");
    if($desc)
        description = $desc.attr("content");

    var info = "";
    if(title && description)
        info  = ("<h4>"+title+"</h4>"+
                 "<p>"+description+"</p>");

    // Insert menu
    var $menucontainer = $([
        "<div id='menu-container'>",
            "<button class='btn' id='menu-container-open'>Open menu</button>",
            "<div id='menu' class='well'>",
                "<button class='btn' id='menu-hide'>Hide menu</button>",

                "<button class='btn' id='menu-fullscreen'>Full screen</button>",
                "<button class='btn' id='menu-zoom-in'><i class='icon-zoom-in'></i></button>",
                "<button class='btn' id='menu-zoom-out'><i class='icon-zoom-out'></i></button>",

                info,

                "<fieldset id='menu-controls-container'>",
                    "<h4>Simulation control</h4>",
                    "<button class='btn' id='menu-restart'><b class='icon-fast-backward'></b></button>",
                    "<button class='btn' id='menu-playpause'>"+pauseHtml+"</button>",
                    "<button class='btn' id='menu-step'><b class='icon-step-forward'></b></button>",
                "</fieldset>",

                "<fieldset id='menu-tools'>",
                    "<h4>Tools</h4>",
                    "<div class='btn-group'>",
                        "<button class='btn' id='menu-tools-default'>Pick/pan</button>",
                        "<button class='btn' id='menu-tools-polygon'>Polygon</button>",
                        "<button class='btn' id='menu-tools-circle'>Circle</button>",
                    "</div>",
                "</fieldset>",

                "<fieldset id='menu-solver-container'>",
                    "<h4>Solver</h4>",

                    "<div class='input-prepend input-block-level'>",
                      "<span class='add-on'>Iterations</span>",
                      "<input id='menu-solver-iterations' type='number' min='1' value='"+this.world.solver.iterations+"'>",
                    "</div>",

                    "<div class='input-prepend input-block-level'>",
                      "<span class='add-on'>Relaxation</span>",
                      "<input id='menu-solver-relaxation' type='number' step='any' min='0' value='"+this.relaxation+"'>",
                    "</div>",

                    "<div class='input-prepend input-block-level'>",
                      "<span class='add-on'>Stiffness</span>",
                      "<input id='menu-solver-stiffness' type='number' step='any' min='0' value='"+this.stiffness+"'>",
                    "</div>",

                    "<div class='input-prepend input-block-level'>",
                      "<span class='add-on'>Tolerance</span>",
                      "<input id='menu-solver-tolerance' type='number' step='any' min='0' value='"+this.world.solver.tolerance+"'>",
                    "</div>",

                "</fieldset>",

            "</div>",
        "</div>"
    ].join("\n")).disableSelection();
    $("body").append($menucontainer);

    var $menu = $("#menu").hide(),
        $openButton = $("#menu-container-open");

    // Hide menu
    $("#menu-hide").click(function(e){
        $menu.hide();
        $openButton.show();
    });

    // Open menu
    $("#menu-container-open").click(function(e){
        $menu.show();
        $openButton.hide();
    });

    // Play/pause
    $("#menu-playpause").click(function(e){
        that.paused = !that.paused;
        if(that.paused) $(this).html(playHtml);
        else            $(this).html(pauseHtml);
    }).tooltip({
        title : "Play or pause simulation [p]",
    });

    // Step
    $("#menu-step").click(function(e){
        that.world.step(that.world.lastTimeStep);
    }).tooltip({
        title : "Step simulation [s]",
    });

    // Restart
    $("#menu-restart").click(function(e){
        // Until Demo gets a restart() method
        that.removeAllVisuals();
        that.world.fromJSON(that.initialState);
        //that.serializer.deserialize(that.initialState,that.world,p2);
    }).tooltip({
        title : "Restart simulation [r]",
    }),

    // Zoom in
    $("#menu-zoom-in").click(function(e){
        that.emit(Demo.zoomInEvent);
    });
    $("#menu-zoom-out").click(function(e){
        that.emit(Demo.zoomOutEvent);
    });

    $("#menu-fullscreen").click(function(evt){
        var elem = document.body;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
    });

    $("#menu-solver-iterations").change(function(e){
        var solver = that.world.solver;
        solver.iterations = parseInt($(this).val());
    }).tooltip({
        title : '# timesteps needed for stabilization'
    });
    $("#menu-solver-relaxation").change(function(e){
        that.relaxation = parseFloat($(this).val());
        that.setEquationParameters();
    }).tooltip({
        title : '# timesteps needed for stabilization'
    });
    $("#menu-solver-stiffness").change(function(e){
        that.stiffness = parseFloat($(this).val());
        that.setEquationParameters();
    }).tooltip({
        title : "Constraint stiffness",
    });
    $("#menu-solver-tolerance").change(function(e){
        var tolerance = parseFloat($(this).val());
        if(tolerance >= 0){
            that.world.solver.tolerance = tolerance;
        }
    }).tooltip({
        title : "Solver tolerance",
    });

    $("#menu-tools-default").click(function(e){
        that.setState(Demo.DEFAULT);
    }).tooltip({
        title : "Pick and pan tool",
    });
    $("#menu-tools-polygon").click(function(e){
        that.setState(Demo.DRAWPOLYGON);
    }).tooltip({
        title : "Draw polygon [d]",
    });
    $("#menu-tools-circle").click(function(e){
        that.setState(Demo.DRAWCIRCLE);
    }).tooltip({
        title : "Draw circle [a]",
    });
};

Demo.zoomInEvent = {
    type:"zoomin"
};
Demo.zoomOutEvent = {
    type:"zoomout"
};

Demo.prototype.setEquationParameters = function(){
    this.world.setGlobalEquationParameters({
        stiffness: this.stiffness,
        relaxation: this.relaxation
    });
};

Demo.prototype.updateTools = function(){
    $("#menu-tools button").removeClass("active");
    var id;
    switch(this.state){
        case Demo.PANNING:
        case Demo.DRAGGING:
        case Demo.DEFAULT:        id = "#menu-tools-default"; break;
        case Demo.DRAWINGPOLYGON:
        case Demo.DRAWPOLYGON:    id = "#menu-tools-polygon"; break;
        case Demo.DRAWINGCIRCLE:
        case Demo.DRAWCIRCLE:     id = "#menu-tools-circle";  break;
        default:
            console.warn("Demo: uncaught state: "+this.state);
            break;
    }
    if(id){
        $(id).addClass("active");
    }
};
