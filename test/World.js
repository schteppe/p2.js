var World = require("../src/world/World")
,   Body = require("../src/objects/Body")
,   Particle = require("../src/shapes/Particle")
,   Circle = require("../src/shapes/Circle")
,   Rectangle = require("../src/shapes/Rectangle")
,   Convex = require("../src/shapes/Convex")
,   Line = require("../src/shapes/Line")
,   Capsule = require("../src/shapes/Capsule")
,   Plane = require("../src/shapes/Plane")
,   Spring = require("../src/objects/Spring")
,   Material = require("../src/material/Material")
,   ContactMaterial = require("../src/material/ContactMaterial")
,   DistanceConstraint = require("../src/constraints/DistanceConstraint")
,   RevoluteConstraint = require("../src/constraints/RevoluteConstraint")
,   PrismaticConstraint = require("../src/constraints/PrismaticConstraint")
,   vec2 = require("../src/math/vec2")
,   _ = require('underscore')

var world;

exports.setUp = function(callback){
    world = new World();
    callback();
};

exports.toJSON = function(test){

    var r = Math.random,
        rv = function(){ return [r(),r()]; },
        lastMaterial,
        size = 1,
        shapes = [
            new Particle(),
            new Circle(size/2),
            new Rectangle(size,size),
            new Convex([]),
            new Line(size),
            new Capsule(size*2,size/4),
            new Plane(),
        ];

    // Set gravity
    vec2.set(world.gravity,r(),r());

    // Collision groups
    groups = [1,2,4];

    // Add all shape types
    for(var i=0; i<shapes.length; i++){
        var b = new Body({
                position : [r(),r()],
                velocity:[r(),r()],
                force : [r(),r()],
                mass : r(),
                angle : r(),
                angularVelocity : r(),
            }),
            s = shapes[i];

        // Set collision masks and groups
        s.collisionGroup = groups[_.random(0,groups.length-1)];
        s.collisionMask = groups[_.random(0,groups.length-1)];

        // Add shape at given position
        b.addShape(s,rv(),r());

        // Things that should be different for the first body
        if(i==0){
            // Add material
            s.material = new Material();
            lastMaterial = s.material;

            // Set concavePath
            b.concavePath = [rv(),rv(),rv(),rv()];
        }

        world.addBody(b);
    }

    var bodyA = world.bodies[0],
        bodyB = world.bodies[1];

    // Add springs
    world.addSpring(new Spring(bodyA,bodyB,{
        stiffness : r(),
        damping : r(),
        restLength : r(),
        localAnchorA : rv(),
        localAnchorB : rv(),
    }));

    // Create contact material
    if(lastMaterial){
        var cm = new ContactMaterial(lastMaterial,lastMaterial,{
            friction :              r(),
            restitution :           r(),
            stiffness :             r(),
            relaxation :            r(),
            frictionStiffness :     r(),
            frictionRelaxation :    r(),
        });
        world.addContactMaterial(cm);
    }

    // Add distance constraint
    world.addConstraint(new DistanceConstraint(bodyA,bodyB,r(),r()));

    // p2p without motor
    world.addConstraint(new RevoluteConstraint(bodyA,rv(),bodyB,rv(),r()));
    // p2p with motor
    var p2p = new RevoluteConstraint(bodyA,rv(),bodyB,rv(),r());
    p2p.enableMotor = true;
    p2p.setMotorSpeed(r());
    world.addConstraint(p2p);

    // Prismatic
    world.addConstraint(new PrismaticConstraint(bodyA, bodyB, {
        maxForce : r(),
        localAxisA : rv(),
        localAxisB : rv(),
    }));

    // JSON roundtrip
    var world2 = new World();
    var json = world.toJSON();
    world2.fromJSON(json);

    // The only thing that should differ between the two worlds are the id's of
    // things. Therefore, we must set them to the same
    for(var i=0; i<world.bodies.length; i++){
        var b1 = world.bodies[i],
            b2 = world2.bodies[i];
        b1.id = b2.id;
        for(var j=0; j<b1.shapes.length; j++){
            var s1 = b1.shapes[j],
                s2 = b2.shapes[j];
            if(s1.material)
                s1.material.id = s2.material.id;
        }
    }

    test.deepEqual(world.constraints[0],world2.constraints[0],"World should be the same after a JSON roundtrip");

    test.done();
};

exports.hitTest = function(test){
    var b = new Body();
    world.addBody(b);
    test.deepEqual(world.hitTest([0,0],[b]) , [], "Should miss bodies without shapes");

    b.addShape(new Circle(1));
    test.deepEqual(world.hitTest([0,0],[b]) , [b], "Should hit Circle");
    test.deepEqual(world.hitTest([1.1,0],[b]) , [], "Should miss Circle");

    b = new Body();
    b.addShape(new Convex([ [-1,-1],
                            [ 1,-1],
                            [ 1, 1],
                            [-1, 1]]));
    test.deepEqual(world.hitTest([0,0],  [b]) , [b],  "Should hit Convex");
    test.deepEqual(world.hitTest([1.1,0],[b]) , [], "Should miss Convex");

    test.done();
}
