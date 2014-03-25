var World = require(__dirname + '/../../src/world/World')
,   Body = require(__dirname + '/../../src/objects/Body')
,   Circle = require(__dirname + '/../../src/shapes/Circle')
,   Convex = require(__dirname + '/../../src/shapes/Convex')
,   pkg = require(__dirname + '/../../package.json')

exports.construct = function(test){
    // STUB
    test.done();
};

exports.addBody = function(test){
    // STUB
    test.done();
};

exports.addConstraint = function(test){
    // STUB
    test.done();
};

exports.addContactMaterial = function(test){
    // STUB
    test.done();
};

exports.addSpring = function(test){
    // STUB
    test.done();
};

exports.clear = function(test){
    // STUB
    test.done();
};

exports.clone = function(test){
    // STUB
    test.done();
};

exports.disableBodyCollision = function(test){
    var bodyA = new Body({ mass:1 }),
        bodyB = new Body({ mass:1 }),
        world = new World();
    bodyA.addShape(new Circle(1));
    bodyB.addShape(new Circle(1));
    world.addBody(bodyA);
    world.addBody(bodyB);
    world.disableBodyCollision(bodyA,bodyB);
    world.step(1/60);
    test.equal(world.narrowphase.contactEquations.length,0);
    world.enableBodyCollision(bodyA,bodyB);
    world.step(1/60);
    test.equal(world.narrowphase.contactEquations.length,1);
    test.done();
};

var sample = {
    p2: pkg.version,
    gravity: [0,-10],
    solver: {
        type: "GSSolver",
        iterations: 10,
        stiffness : 1e7,
        relaxation: 3,
    },
    broadphase: {
        type:"SAPBroadphase",
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
        fixedRotation : false,
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
            vertices : [[0,1],[0,0],[1,0]],
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
        fixedRotation : false,
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
        collideConnected : true,
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
        collideConnected : true,
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
        collideConnected : true,
    }],
    lockConstraints : [{
        bodyA:          0,
        bodyB:          1,
        localOffsetB:   [0,0],
        localAngleB:    0,
        maxForce:       1e6,
        collideConnected : true,
    }],
    gearConstraints : [{
        bodyA:          0,
        bodyB:          1,
        angle:          0,
        ratio:          0,
        maxForce:       1e6,
        collideConnected : true,
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
    }],
    defaultContactMaterial : {
        id:2,
        materialA:1,
        materialB:1,
        stiffness:1e6,
        relaxation:3,
        frictionStiffness:1e6,
        frictionRelaxation:3,
        friction:0.3,
        restitution:0.3,
    }
};

exports.fromJSON = function(test){
    var world = new World();
    world.fromJSON(sample);
    var json = world.toJSON();
    test.ok(!!json);
    for(var key in sample){
        test.deepEqual(json[key],sample[key],key+" didnt survive roundtrip!");
    }
    test.done();
};

exports.getBodyById = function(test){
    // STUB
    test.done();
};

exports.getContactMaterial = function(test){
    // STUB
    test.done();
};

exports.hitTest = function(test){
    var b = new Body(),
        world = new World();
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
};

exports.integrateBody = function(test){
    // STUB
    test.done();
};

exports.removeBody = function(test){
    // STUB
    test.done();
};

exports.removeConstraint = function(test){
    // STUB
    test.done();
};

exports.removeContactMaterial = function(test){
    // STUB
    test.done();
};

exports.removeSpring = function(test){
    // STUB
    test.done();
};

exports.runNarrowphase = function(test){
    // STUB
    test.done();
};

exports.step = function(test){
    // STUB
    test.done();
};

exports.toJSON = function(test){
    var world = new World();
    var json = world.toJSON();
    test.done();
};

exports.upgradeJSON = function(test){
    // STUB
    test.done();
};

exports.events = {
    beginContact : function(test){
        var world = new World(),
            bodyA = new Body({ mass:1 }),
            bodyB = new Body({ mass:1 });
        world.addBody(bodyA);
        world.addBody(bodyB);
        var shapeA = new Circle(1),
            shapeB = new Circle(1);
        bodyA.addShape(shapeA);
        bodyB.addShape(shapeB);
        var beginContactHits = 0,
            endContactHits = 0;
        world.on("beginContact",function(evt){
            test.ok( evt.shapeA.id == shapeA.id || evt.shapeA.id == shapeB.id );
            test.ok( evt.shapeB.id == shapeA.id || evt.shapeB.id == shapeB.id );
            test.ok( evt.bodyA.id == bodyA.id || evt.bodyA.id == bodyB.id );
            test.ok( evt.bodyB.id == bodyA.id || evt.bodyB.id == bodyB.id );
            beginContactHits++;
        });
        world.on("endContact",function(evt){
            test.ok( evt.shapeA.id == shapeA.id || evt.shapeA.id == shapeB.id );
            test.ok( evt.shapeB.id == shapeA.id || evt.shapeB.id == shapeB.id );
            test.ok( evt.bodyA.id == bodyA.id || evt.bodyA.id == bodyB.id );
            test.ok( evt.bodyB.id == bodyA.id || evt.bodyB.id == bodyB.id );
            endContactHits++;
        });
        world.step(1/60);
        bodyA.position[0] = 10;
        world.step(1/60);

        test.equal(beginContactHits,1);
        test.equal(endContactHits,1);

        test.done();
    },
};
