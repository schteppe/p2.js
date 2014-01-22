var World = require('../world/World')
,   Spring = require('../objects/Spring')
,   Body = require('../objects/Body')
,   Capsule = require('../shapes/Capsule')
,   Circle = require('../shapes/Circle')
,   Plane = require('../shapes/Plane')
,   Rectangle = require('../shapes/Rectangle')
,   Particle = require('../shapes/Particle')
,   Line = require('../shapes/Line')
,   Convex = require('../shapes/Convex')
,   ContactMaterial = require('../material/ContactMaterial')
,   Material = require('../material/Material')
,   JSONFileFormat = require('./JSONFileFormat')
,   pkg = require('../../package.json')
,   vec2 = require('../math/vec2')
,   GSSolver = require("../solver/GSSolver")
,   IslandSolver = require("../solver/IslandSolver")
,   NaiveBroadphase = require("../collision/NaiveBroadphase")
,   SAP1DBroadphase = require("../collision/SAP1DBroadphase")
,   DistanceConstraint = require("../constraints/DistanceConstraint")
,   RevoluteConstraint = require("../constraints/RevoluteConstraint")
,   PrismaticConstraint = require("../constraints/PrismaticConstraint")
,   LockConstraint = require("../constraints/LockConstraint")

module.exports = Serializer;

function Serializer(){
    JSONFileFormat.call(this,{
        getVersionFunc : function(instance){
            return instance.p2 || false;
        },
    });

    var num_v1 = { type:"number" },
    id_v1 = {
        type:"integer",
        minimum:0,
    },
    nullable_id_v1 = {
        type:["integer","null"],
    },
    uint_v1 = {
        type:"integer",
        minimum:0,
    },
    bool_v1 = { type:"boolean" },
    vec2_v1 = {
        type:"array",
        maxItems:2,
        minItems:2,
        items:num_v1,
    },
    capsuleShape_v1 = {
        type:"object",
        properties:{
            length:num_v1,
            radius:num_v1,
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    circleShape_v1 = {
        type:"object",
        properties:{
            radius:num_v1,
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    convexShape_v1 = {
        type:"object",
        properties:{
            vertices:{
                type:"array",
                items:vec2_v1,
            },
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    lineShape_v1 = {
        type:"object",
        properties:{
            length:num_v1,
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    particleShape_v1 = {
        type:"object",
        properties:{
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    planeShape_v1 = {
        type:"object",
        properties:{
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    rectangleShape_v1 = {
        type:"object",
        properties:{
            width:num_v1,
            height:num_v1,
            offset : vec2_v1,
            angle : num_v1,
            collisionGroup : uint_v1,
            collisionMask : uint_v1,
            material : nullable_id_v1,
        },
    },
    body_v1 = {
        type:"object",
        properties:{
            id :                id_v1,
            mass :              num_v1,
            angle :             num_v1,
            position :          vec2_v1,
            velocity :          vec2_v1,
            angularVelocity :   num_v1,
            force :             vec2_v1,
            motionState :       uint_v1,
            capsuleShapes :     { type:"array", items:capsuleShape_v1 },
            circleShapes :      { type:"array", items:circleShape_v1 },
            convexShapes :      { type:"array", items:convexShape_v1 },
            lineShapes :        { type:"array", items:lineShape_v1 },
            particleShapes :    { type:"array", items:particleShape_v1 },
            planeShapes :       { type:"array", items:planeShape_v1 },
            rectangleShapes :   { type:"array", items:rectangleShape_v1 },
            concavePath :       {
                type:["null",{
                    type:"array",
                    items:vec2_v1,
                }],
            },
        },
    },
    spring_v1 = {
        type:"object",
        properties:{
            bodyA :         num_v1,
            bodyB :         num_v1,
            stiffness :     num_v1,
            damping :       num_v1,
            restLength :    num_v1,
            localAnchorA :  vec2_v1,
            localAnchorB :  vec2_v1,
        },
    },
    contactMaterial_v1 = {
        type:"object",
        properties : {
            id:                 id_v1,
            materialA:          num_v1,
            materialB:          num_v1,
            friction:           num_v1,
            restitution:        num_v1,
            stiffness:          num_v1,
            relaxation:         num_v1,
            frictionStiffness:  num_v1,
            frictionRelaxation: num_v1,
        }
    },
    material_v1 = {
        type:"object",
        properties : {
            id: id_v1,
        }
    },
    distanceConstraint_v1 = {
        type:"object",
        properties:{
            bodyA:      num_v1,
            bodyB:      num_v1,
            distance:   num_v1,
            maxForce:   num_v1,
        },
    },
    prismaticConstraint_v1 = {
        type:"object",
        properties:{
            bodyA:              num_v1,
            bodyB:              num_v1,
            localAxisA:         vec2_v1,
            localAnchorA:       vec2_v1,
            localAnchorB:       vec2_v1,
            maxForce:           num_v1,
            motorEnabled:       bool_v1,
            motorSpeed:         num_v1,
            lowerLimit:         num_v1,
            lowerLimitEnabled:  bool_v1,
            upperLimit:         num_v1,
            upperLimitEnabled:  bool_v1,
        },
    },
    revoluteConstraint_v1 = {
        type:"object",
        properties:{
            bodyA:              num_v1,
            bodyB:              num_v1,
            pivotA:             vec2_v1,
            pivotB:             vec2_v1,
            maxForce:           num_v1,
            motorEnabled :      bool_v1,
            motorSpeed:         num_v1,
            lowerLimit:         num_v1,
            lowerLimitEnabled:  bool_v1,
            upperLimit:         num_v1,
            upperLimitEnabled:  bool_v1,
        },
    },
    lockConstraint_v1 = {
        type:"object",
        properties:{
            bodyA:              num_v1,
            bodyB:              num_v1,
            localOffsetB:       vec2_v1,
            localAngleB:        num_v1,
            maxForce:           num_v1,
        },
    },
    solver_v1 = {
        type:"object",
        properties:{
            type:{
                type:"string",
                pattern:/^(GSSolver)|(IslandSolver)$/,
            },
            iterations:  num_v1, // todo should be integer > 0
            stiffness:   num_v1,
            relaxation : num_v1,
        }
    },
    broadphase_v1 = {
        type:[{
            type:"object",
            properties:{
                type:{
                    type:"string",
                    pattern:/^NaiveBroadphase$/,
                }
            },
        },{
            type:"object",
            properties:{
                type:{
                    type:"string",
                    pattern:/^SAP1DBroadphase$/,
                },
                axisIndex : {
                   type : "integer",
                   minimum : 0,
                   maximum : 1,
               },
            },
        }],
    },
    version_v1 = {
        type:"string",
        pattern:/^\d+.\d+.\d+$/,
    };

    // Latest version
    this.addVersion(pkg.version,{
        type: "object",
        properties: {
            p2:                     version_v1,
            gravity:                vec2_v1,
            solver:                 solver_v1,
            broadphase:             broadphase_v1,
            bodies:                 { type:"array", items: body_v1,   },
            springs:                { type:"array", items: spring_v1, },
            distanceConstraints :   { type:"array", items: distanceConstraint_v1,   },
            revoluteConstraints :   { type:"array", items: revoluteConstraint_v1,   },
            prismaticConstraints :  { type:"array", items: prismaticConstraint_v1,  },
            lockConstraints :       { type:"array", items: lockConstraint_v1,  },
            contactMaterials :      { type:"array", items: contactMaterial_v1,      },
            materials :             { type:"array", items: material_v1,      },
        }
    });
}
Serializer.prototype = new JSONFileFormat();

// Sample instance at latest version
Serializer.sample = {
    p2: pkg.version,
    gravity: [0,-10],
    solver: {
        type: "GSSolver",
        iterations: 10,
        stiffness : 1e7,
        relaxation: 3,
    },
    broadphase: {
        type:"SAP1DBroadphase",
        axisIndex : 0,
    },
    bodies: [{
        id :       1,
        mass :     1,
        angle :    0,
        position : [0,0],
        velocity : [0,0],
        angularVelocity : 0,
        force : [0,0],
        motionState : 1,
        concavePath : null,
        capsuleShapes : [{
            length : 1,
            radius : 2,
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
        circleShapes : [{
            radius : 2,
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
        convexShapes : [{
            vertices : [[0,1],[1,0],[0,0]],
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
        lineShapes : [{
            length : 1,
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
        particleShapes : [{
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
        planeShapes : [{
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
        rectangleShapes :   [{
            width:1,
            height:1,
            offset : [0,0],
            angle : 0,
            collisionGroup:1,
            collisionMask : 1,
            material : 1,
        }],
    },{
        id :       2,
        mass :     1,
        angle :    0,
        position : [0,0],
        velocity : [0,0],
        angularVelocity : 0,
        force : [0,0],
        motionState : 1,
        concavePath : [[0,0],[1,0],[1,1]],
        capsuleShapes :     [],
        circleShapes :      [],
        convexShapes :      [],
        lineShapes :        [],
        particleShapes :    [],
        planeShapes :       [],
        rectangleShapes :   [],
    }],
    springs: [{
        bodyA :         0,
        bodyB :         1,
        stiffness :     100,
        damping :       1,
        restLength :    1,
        localAnchorA :  [1,2],
        localAnchorB :  [-1,-2],
    }],
    distanceConstraints :   [{
        bodyA:      0,
        bodyB:      1,
        distance:   1,
        maxForce:   1e6,
    }],
    revoluteConstraints :   [{
        bodyA:              0,
        bodyB:              1,
        pivotA:             [0,0],
        pivotB:             [0,0],
        maxForce:           1e6,
        motorEnabled :      true,
        motorSpeed:         1,
        lowerLimit:         0,
        lowerLimitEnabled:  false,
        upperLimit:         1,
        upperLimitEnabled:  false,
    }],
    prismaticConstraints :  [{
        bodyA:      0,
        bodyB:      1,
        localAnchorA: [0,0],
        localAnchorB: [0,0],
        localAxisA: [0,0],
        maxForce:   1e6,
        motorEnabled:false,
        motorSpeed:1,
        lowerLimit:         0,
        lowerLimitEnabled:  false,
        upperLimit:         1,
        upperLimitEnabled:  false,
    }],
    lockConstraints : [{
        bodyA:          0,
        bodyB:          1,
        localOffsetB:   [0,0],
        localAngleB:    0,
        maxForce:       1e6,
    }],
    contactMaterials : [{
        id:1,
        materialA:1,
        materialB:2,
        stiffness:1e6,
        relaxation:3,
        frictionStiffness:1e6,
        frictionRelaxation:3,
        friction:0.3,
        restitution:0.3,
    }],
    materials : [{
        id:1,
    },{
        id:2,
    }]
};

/*
 * Serialize a World instance to JSON
 * @method serialize
 * @param  {World} world
 * @return {Object}
 */
Serializer.prototype.serialize = function(world){
    var json = {
        p2 :                    pkg.version,
        bodies :                [],
        springs :               [],
        solver :                {},
        gravity :               v2a(world.gravity),
        broadphase :            {},
        distanceConstraints :   [],
        revoluteConstraints :   [],
        prismaticConstraints :  [],
        lockConstraints :       [],
        contactMaterials :      [],
        materials :             [],
    };

    // Solver
    var js = json.solver,
        s = world.solver;
    if(s instanceof GSSolver){
        js.type = "GSSolver";
        js.iterations = s.iterations;
        js.stiffness = s.stiffness;
        js.relaxation = s.relaxation;
    } else if(s instanceof IslandSolver) {
        js.type = "IslandSolver";
    }

    // Broadphase
    var jb = json.broadphase,
        wb = world.broadphase;
    if(wb instanceof NaiveBroadphase){
        jb.type = "NaiveBroadphase";
    } else if(wb instanceof SAP1DBroadphase) {
        jb.type = "SAP1DBroadphase";
        jb.axisIndex = wb.axisIndex;
    }

    // Serialize springs
    for(var i=0; i!==world.springs.length; i++){
        var s = world.springs[i];
        json.springs.push({
            bodyA :         world.bodies.indexOf(s.bodyA),
            bodyB :         world.bodies.indexOf(s.bodyB),
            stiffness :     s.stiffness,
            damping :       s.damping,
            restLength :    s.restLength,
            localAnchorA :  v2a(s.localAnchorA),
            localAnchorB :  v2a(s.localAnchorB),
        });
    }

    // Serialize constraints
    for(var i=0; i<world.constraints.length; i++){
        var c = world.constraints[i];
        var jc = {
            bodyA : world.bodies.indexOf(c.bodyA),
            bodyB : world.bodies.indexOf(c.bodyB),
        }
        if(c instanceof DistanceConstraint){
            extend(jc,{
                distance : c.distance,
                maxForce : c.getMaxForce(),
            });
            json.distanceConstraints.push(jc);

        } else if(c instanceof RevoluteConstraint){
            extend(jc,{
                pivotA :            v2a(c.pivotA),
                pivotB :            v2a(c.pivotB),
                maxForce :          c.maxForce,
                motorSpeed :        c.getMotorSpeed() || 0,
                motorEnabled :       !!c.getMotorSpeed(),
                lowerLimit :        c.lowerLimit,
                lowerLimitEnabled : c.lowerLimitEnabled,
                upperLimit :        c.upperLimit,
                upperLimitEnabled : c.upperLimitEnabled,
            });
            json.revoluteConstraints.push(jc);

        } else if(c instanceof PrismaticConstraint){
            extend(jc,{
                localAxisA :    v2a(c.localAxisA),
                localAnchorA :  v2a(c.localAnchorA),
                localAnchorB :  v2a(c.localAnchorB),
                maxForce :      c.maxForce,
                upperLimitEnabled : c.upperLimitEnabled,
                lowerLimitEnabled : c.lowerLimitEnabled,
                upperLimit : c.upperLimit,
                lowerLimit : c.lowerLimit,
                motorEnabled : c.motorEnabled,
                motorSpeed : c.motorSpeed,
            });
            json.prismaticConstraints.push(jc);

        } else if(c instanceof LockConstraint){
            extend(jc,{
                localOffsetB :  v2a(c.localOffsetB),
                localAngleB :   c.localAngleB,
                maxForce :      c.maxForce,
            });
            json.lockConstraints.push(jc);

        } else {
            console.error("Constraint not supported yet!");
            continue;
        }
    }

    // Serialize bodies
    for(var i=0; i!==world.bodies.length; i++){
        var b = world.bodies[i],
            ss = b.shapes,
            jsonBody = {
                id : b.id,
                mass : b.mass,
                angle : b.angle,
                position : v2a(b.position),
                velocity : v2a(b.velocity),
                angularVelocity : b.angularVelocity,
                force : v2a(b.force),
                motionState : b.motionState,
                concavePath : b.concavePath,
                circleShapes :    [],
                planeShapes :     [],
                particleShapes :  [],
                lineShapes :      [],
                rectangleShapes : [],
                convexShapes :    [],
                capsuleShapes :   [],
            };

        for(var j=0; j<ss.length; j++){
            var s = ss[j],
                jsonShape = {};

            jsonShape.offset = v2a(b.shapeOffsets[j]);
            jsonShape.angle = b.shapeAngles[j];
            jsonShape.collisionGroup = s.collisionGroup;
            jsonShape.collisionMask = s.collisionMask;
            jsonShape.material = s.material ? {
                id : s.material.id,
            } : null;

            // Check type
            if(s instanceof Circle){
                extend(jsonShape,{ radius : s.radius, });
                jsonBody.circleShapes.push(jsonShape);

            } else if(s instanceof Plane){
                jsonBody.planeShapes.push(jsonShape);

            } else if(s instanceof Particle){
                jsonBody.particleShapes.push(jsonShape);

            } else if(s instanceof Line){
                jsonShape.length = s.length;
                jsonBody.lineShapes.push(jsonShape);

            } else if(s instanceof Rectangle){
                extend(jsonShape,{   width : s.width,
                                     height : s.height });
                jsonBody.rectangleShapes.push(jsonShape);

            } else if(s instanceof Convex){
                var verts = [];
                for(var k=0; k<s.vertices.length; k++)
                    verts.push(v2a(s.vertices[k]));
                extend(jsonShape,{ vertices : verts });
                jsonBody.convexShapes.push(jsonShape);

            } else if(s instanceof Capsule){
                extend(jsonShape,{ length : s.length, radius : s.radius });
                jsonBody.capsuleShapes.push(jsonShape);

            } else {
                throw new Error("Shape type not supported yet!");
            }
        }

        json.bodies.push(jsonBody);
    }

    // Serialize contactmaterials
    for(var i=0; i<world.contactMaterials.length; i++){
        var cm = world.contactMaterials[i];
        json.contactMaterials.push({
            id : cm.id,
            materialA :             cm.materialA.id, // Note: Reference by id!
            materialB :             cm.materialB.id,
            friction :              cm.friction,
            restitution :           cm.restitution,
            stiffness :             cm.stiffness,
            relaxation :            cm.relaxation,
            frictionStiffness :     cm.frictionStiffness,
            frictionRelaxation :    cm.frictionRelaxation,
        });
    }

    return json;
};

function v2a(v){
    if(!v) return v;
    return [v[0],v[1]];
}

function extend(a,b){
    for(var key in b)
        a[key] = b[key];
}

/*
 * Load a World instance from JSON
 * @param  {Object} json
 * @return {World}
 */
Serializer.prototype.deserialize = function(json,world){

    // Upgrade to latest JSON version
    if(!this.upgrade(json)) return false;

    // Load
    var w = world || new World();
    w.clear();

    // Set gravity
    vec2.copy(w.gravity, json.gravity);

    // Set solver
    switch(json.solver.type){
        case "GSSolver":
            var js = json.solver,
                s = new GSSolver();
            w.solver = s;
            s.iterations = js.iterations;
            s.relaxation = js.relaxation;
            s.stiffness =  js.stiffness;
            break;

        case "IslandSolver":
            w.solver = new IslandSolver();
            break;
    }

    // Broadphase
    switch(json.broadphase.type){
        case "NaiveBroadphase":
            w.broadphase = new NaiveBroadphase();
            break;

        case "SAP1DBroadphase":
            w.broadphase = new SAP1DBroadphase();
            break;
    }
    w.broadphase.setWorld(w);


    var bodies = w.bodies;

    // Load materials
    var id2material = {};
    for(var i=0; i!==json.materials.length; i++){
        var jm = json.materials[i];
        var m = new Material();
        id2material[jm.id+""] = m;
        m.id = jm.id;
    }

    // Load bodies
    for(var i=0; i!==json.bodies.length; i++){
        var jb = json.bodies[i];

        // Create body
        var b = new Body({
            mass :              jb.mass,
            position :          jb.position,
            angle :             jb.angle,
            velocity :          jb.velocity,
            angularVelocity :   jb.angularVelocity,
            force :             jb.force,
        });
        b.id = jb.id;
        b.motionState = jb.motionState;

        // Circle
        for(var j=0; j<jb.circleShapes.length; j++){
            var s = jb.circleShapes[i];
            addShape(b, new Circle(s.radius), s);
        }

        // Plane
        for(var j=0; j<jb.planeShapes.length; j++){
            var s = jb.planeShapes[i];
            addShape(b, new Plane(), s);
        }

        // Particle
        for(var j=0; j<jb.particleShapes.length; j++){
            var s = jb.particleShapes[i];
            addShape(b, new Particle(), s);
        }

        // Line
        for(var j=0; j<jb.lineShapes.length; j++){
            var s = jb.lineShapes[i];
            addShape(b, new Line(s.length), s);
        }

        // Rectangle
        for(var j=0; j<jb.rectangleShapes.length; j++){
            var s = jb.rectangleShapes[i];
            addShape(b, new Rectangle(s.width,s.height), s);
        }

        // Convex
        for(var j=0; j<jb.convexShapes.length; j++){
            var s = jb.convexShapes[i];
            addShape(b, new Convex(s.verts), s);
        }

        // Capsule
        for(var j=0; j<jb.capsuleShapes.length; j++){
            var s = jb.capsuleShapes[i];
            addShape(b, new Capsule(s.length, s.radius), s);
        }

        function addShape(body, shapeObject, shapeJSON){
            shapeObject.collisionMask = shapeJSON.collisionMask;
            shapeObject.collisionGroup = shapeJSON.collisionGroup;
            if(shapeJSON.material){
                shapeObject.material = id2material[shapeObject.material+""];
            }
            body.addShape(shapeObject, shapeJSON.offset,shapeJSON.angle);
        }

        if(jb.concavePath)
            b.concavePath = jb.concavePath;

        w.addBody(b);
    }

    // Load springs
    for(var i=0; i<json.springs.length; i++){
        var js = json.springs[i];
        var bodyA = bodies[js.bodyA],
            bodyB = bodies[js.bodyB];
        if(!bodyA){
            this.error = "instance.springs["+i+"] references instance.body["+js.bodyA+"], which does not exist.";
            return false;
        }
        if(!bodyB){
            this.error = "instance.springs["+i+"] references instance.body["+js.bodyB+"], which does not exist.";
            return false;
        }
        var s = new Spring(bodyA, bodyB, {
            stiffness : js.stiffness,
            damping : js.damping,
            restLength : js.restLength,
            localAnchorA : js.localAnchorA,
            localAnchorB : js.localAnchorB,
        });
        w.addSpring(s);
    }

    // Load contact materials
    for(var i=0; i<json.contactMaterials.length; i++){
        var jm = json.contactMaterials[i],
            matA = id2material[jm.materialA+""],
            matB = id2material[jm.materialB+""];

        if(!matA){
            this.error = "Reference to material id "+jm.materialA+": material not found";
            return false;
        }
        if(!matB){
            this.error = "Reference to material id "+jm.materialB+": material not found";
            return false;
        }

        var cm = new ContactMaterial(matA, matB, {
            friction :              jm.friction,
            restitution :           jm.restitution,
            stiffness :             jm.stiffness,
            relaxation :            jm.relaxation,
            frictionStiffness :     jm.frictionStiffness,
            frictionRelaxation :    jm.frictionRelaxation,
        });
        cm.id = jm.id;
        w.addContactMaterial(cm);
    }

    // DistanceConstraint
    for(var i=0; i<json.distanceConstraints.length; i++){
        var c = json.distanceConstraints[i];
        w.addConstraint(new DistanceConstraint( bodies[c.bodyA],
                                                bodies[c.bodyB],
                                                c.distance,
                                                c.maxForce));
    }

    // RevoluteConstraint
    for(var i=0; i<json.revoluteConstraints.length; i++){
        var c = json.revoluteConstraints[i];
        var revolute = new RevoluteConstraint(  bodies[c.bodyA],
                                                c.pivotA,
                                                bodies[c.bodyB],
                                                c.pivotB,
                                                c.maxForce);
        if(c.motorEnabled){
            revolute.enableMotor();
        }
        revolute.setMotorSpeed(c.motorSpeed);
        revolute.lowerLimit = c.lowerLimit;
        revolute.upperLimit = c.upperLimit;
        revolute.lowerLimitEnabled = c.lowerLimitEnabled;
        revolute.upperLimitEnabled = c.upperLimitEnabled;
        w.addConstraint(revolute);
    }

    // PrismaticConstraint
    for(var i=0; i<json.prismaticConstraints.length; i++){
        var c = json.prismaticConstraints[i],
            p = new PrismaticConstraint(bodies[c.bodyA], bodies[c.bodyB], {
                maxForce : c.maxForce,
                localAxisA : c.localAxisA,
                localAnchorA : c.localAnchorA,
                localAnchorB : c.localAnchorB,
            });
        p.motorSpeed = c.motorSpeed;
        w.addConstraint(p);
    }

    // LockConstraint
    for(var i=0; i<json.lockConstraints.length; i++){
        var c = json.lockConstraints[i];
        w.addConstraint(new LockConstraint(bodies[c.bodyA], bodies[c.bodyB], {
            maxForce :     c.maxForce,
            localOffsetB : c.localOffsetB,
            localAngleB :  c.localAngleB,
        }));
    }

    return w;
};

