var World = require("../src/world/World")
,   Serializer = require("../src/serializer/Serializer")
,   IslandSolver = require("../src/solver/IslandSolver")
,   GSSolver = require("../src/solver/GSSolver")
,   SAP1DBroadphase = require("../src/collision/SAP1DBroadphase")
,   NaiveBroadphase = require("../src/collision/NaiveBroadphase")

var serializer;

function v(a){
    return [a[0],a[1]];
}

exports.create = function(test){
    serializer = new Serializer();
    test.done();
};

exports.serialize = function(test){
    var s = Serializer.sample;
    var world = serializer.deserialize(Serializer.sample);
    var obj = serializer.serialize(world);

    test.ok(typeof(obj) == "object");
    test.ok(serializer.validate(obj));
    test.deepEqual(serializer.validateResult.errors,[])
    //test.deepEqual(s, obj);

    test.done();
};

exports.deserialize = function(test){
    var s = Serializer.sample;
    var world = serializer.deserialize(s);

    test.deepEqual(serializer.validateResult.errors, []);

    test.ok(world instanceof World,'Should return a world instance! '+serializer.error);

    // Gravity
    test.deepEqual(v(world.gravity),s.gravity);

    // Solver
    switch(s.solver.type){
        case "GSSolver":
            test.ok(world.solver instanceof GSSolver);
            test.equal(world.solver.iterations, s.solver.iterations);
            test.equal(world.solver.stiffness,  s.solver.stiffness);
            test.equal(world.solver.relaxation, s.solver.relaxation);
            break;

        case "IslandSolver":
            test.ok(world.solver instanceof IslandSolver);
            break;
    }

    // Broadphase
    switch(s.broadphase.type){
        case "NaiveBroadphase":
            test.ok(world.broadphase instanceof NaiveBroadphase);
            break;
        case "SAP1DBroadphase":
            test.ok(world.broadphase instanceof SAP1DBroadphase);
            break;
    }

    // Bodies
    for(var i=0; i<s.bodies.length; i++){
        var jb = s.bodies[i];
        test.equal(jb.mass,world.bodies[i].mass);
        // Todo check everything
    }

    // Springs
    for(var i=0; i<s.springs.length; i++){
        var js = s.springs[i],
            sp = world.springs[i];
        test.equal(js.restLength, sp.restLength);
        test.equal(js.stiffness, sp.stiffness);
        test.equal(js.damping, sp.damping);
        test.deepEqual(js.localAnchorA, v(sp.localAnchorA));
        test.deepEqual(js.localAnchorB, v(sp.localAnchorB));
    }

    // DistanceConstraints
    var constraintCount = 0;
    for(var i=0; i<s.distanceConstraints.length; i++){
        var jd = s.distanceConstraints[i],
            c = world.constraints[constraintCount];
        test.equal(jd.distance,  c.distance);
        test.equal(jd.maxForce,  c.equations[0].maxForce);
        test.equal(jd.maxForce, -c.equations[0].minForce);
        constraintCount++;
    }

    // RevoluteConstraints
    for(var i=0; i<s.revoluteConstraints.length; i++){
        var jr = s.revoluteConstraints[i],
            c = world.constraints[constraintCount];
        test.deepEqual(v(c.pivotA),     jr.pivotA);
        test.deepEqual(v(c.pivotB),     jr.pivotB);
        test.equal(c.motorEnabled,      jr.motorEnabled);
        test.equal(c.getMotorSpeed(),   jr.motorSpeed);
        test.equal(c.lowerLimit,        jr.lowerLimit);
        test.equal(c.upperLimit,            jr.upperLimit);
        test.equal(c.lowerLimitEnabled,     jr.lowerLimitEnabled);
        test.equal(c.upperLimitEnabled,     jr.upperLimitEnabled);
        test.equal(c.equations[0].maxForce, jr.maxForce);
        constraintCount++;
    }

    // PrismaticConstraints
    for(var i=0; i<s.prismaticConstraints.length; i++){
        var jr = s.prismaticConstraints[i],
            c = world.constraints[constraintCount];
        test.deepEqual(v(c.localAnchorA),   jr.localAnchorA);
        test.deepEqual(v(c.localAnchorB),   jr.localAnchorB);
        test.deepEqual(v(c.localAxisA),     jr.localAxisA);
        test.equal(c.motorEnabled,          jr.motorEnabled);
        test.equal(c.motorSpeed,            jr.motorSpeed);
        test.equal(c.lowerLimit,            jr.lowerLimit);
        test.equal(c.upperLimit,            jr.upperLimit);
        test.equal(c.lowerLimitEnabled,     jr.lowerLimitEnabled);
        test.equal(c.upperLimitEnabled,     jr.upperLimitEnabled);
        test.equal(c.equations[0].maxForce, jr.maxForce);
        constraintCount++;
    }

    // LockConstraints
    for(var i=0; i<s.lockConstraints.length; i++){
        var jr = s.lockConstraints[i],
            c = world.constraints[constraintCount];
        test.deepEqual(v(c.localOffsetB),   jr.localOffsetB);
        test.deepEqual(c.localAngleB,       jr.localAngleB);
        test.equal(c.equations[0].maxForce, jr.maxForce);
        constraintCount++;
    }

    // ContactMaterials
    for(var i=0; i<s.contactMaterials.length; i++){
        var cm = s.contactMaterials[i],
            c = world.contactMaterials[i];
        test.equal(cm.id, c.id);
        test.equal(cm.materialA, c.materialA.id);
        test.equal(cm.materialB, c.materialB.id);
        test.equal(cm.stiffness, c.stiffness);
        test.equal(cm.relaxation, c.relaxation);
        test.equal(cm.frictionStiffness, c.frictionStiffness);
        test.equal(cm.frictionRelaxation, c.frictionRelaxation);
        test.equal(cm.restitution, c.restitution);
    }

    test.done();
};

exports.stringify = function(test){
    var world = new World();
    var str = serializer.stringify(world);
    test.ok(typeof(str) == "string");
    test.done();
};

exports.parse = function(test){
    var str = JSON.stringify(Serializer.sample);
    var world = serializer.parse(str);
    test.ok(world instanceof World);
    test.done();
};
