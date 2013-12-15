var World = require('../world/World')
,   JSONFileFormat = require('./JSONFileFormat')
,    pkg = require('../../package.json')

var f = new JSONFileFormat({
    getVersionFunc : function(instance){
        return instance.p2 || false;
    },
});

/*
 * Serialize a World instance to JSON
 * @method serialize
 * @param  {World} world
 * @return {Object}
 */
exports.serialize = function(world){
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
    };

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
                motorEnable :       !!c.getMotorSpeed(),
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
            jsonShapes = [];

        for(var j=0; j<ss.length; j++){
            var s = ss[j],
                jsonShape = {};

            jsonShape.offset = v2a(b.shapeOffsets[j]);
            jsonShape.angle = b.shapeAngles[j];
            jsonShape.collisionGroup = s.collisionGroup;
            jsonShape.collisionMask = s.collisionMask;
            jsonShape.material = s.material && {
                id : s.material.id,
            };

            // Check type
            if(s instanceof Circle){
                jsonShape = {
                    radius : s.radius,
                };
            } else if(s instanceof Plane){
            } else if(s instanceof Particle){
            } else if(s instanceof Line){
                jsonShape.length = s.length;
            } else if(s instanceof Rectangle){
                extend(jsonShape,{   width : s.width,
                                     height : s.height });
            } else if(s instanceof Convex){
                var verts = [];
                for(var k=0; k<s.vertices.length; k++)
                    verts.push(v2a(s.vertices[k]));
                extend(jsonShape,{ verts : verts });
            } else if(s instanceof Capsule){
                jsonShape = {   type : "Capsule",
                                length : s.length,
                                radius : s.radius };
            } else {
                throw new Error("Shape type not supported yet!");
            }

            jsonShapes.push(jsonShape);
        }

        json.bodies.push({
            id : b.id,
            mass : b.mass,
            angle : b.angle,
            position : v2a(b.position),
            velocity : v2a(b.velocity),
            angularVelocity : b.angularVelocity,
            force : v2a(b.force),
            shapes : jsonShapes,
            concavePath : b.concavePath,
        });
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
exports.deserialize = function(json){

    // Upgrade to latest JSON version
    if(!f.upgrade(json)) return false;

    // Load
    var world = new World();

    return world;
};

var num_v1 = { type:"number" },
bool_v1 = { type:"boolean" },
vec2_v1 = {
    type:"array",
    maxItems:2,
    minItems:2,
    items:num_v1,
},
capsuleShape_v1 = {
    type:"object",
    properties:{},
},
circleShape_v1 = {
    type:"object",
    properties:{},
},
convexShape_v1 = {
    type:"object",
    properties:{},
},
lineShape_v1 = {
    type:"object",
    properties:{},
},
particleShape_v1 = {
    type:"object",
    properties:{},
},
planeShape_v1 = {
    type:"object",
    properties:{},
},
rectangleShape_v1 = {
    type:"object",
    properties:{},
},
body_v1 = {
    type:"object",
    properties:{
        id :                num_v1,
        mass :              num_v1,
        angle :             num_v1,
        position :          vec2_v1,
        velocity :          vec2_v1,
        angularVelocity :   num_v1,
        force :             vec2_v1,
        capsuleShapes :     { type:"array", items:capsuleShape_v1 },
        circleShapes :      { type:"array", items:circleShape_v1 },
        convexShapes :      { type:"array", items:convexShape_v1 },
        lineShapes :        { type:"array", items:lineShape_v1 },
        particleShapes :    { type:"array", items:particleShape_v1 },
        planeShapes :       { type:"array", items:planeShape_v1 },
        rectangleShapes :   { type:"array", items:rectangleShape_v1 },
        concavePath :       { type:["array","null"] },
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
        id:                 num_v1,
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
        bodyA:      num_v1,
        bodyB:      num_v1,
        localAxisA: vec2_v1,
        localAxisB: vec2_v1,
        maxForce:   num_v1,
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
version_v1 = {
    type:"string",
    pattern:"^\d+.\d+.\d+$"
};

f.addVersion("0.3.0",{
    type: "object",
    properties: {
        gravity:                vec2_v1,
        p2:                     version_v1,
        solver:                 { type:"object"  },
        broadphase:             { type:"object"  },
        bodies:                 { type:"array", items: body_v1,   },
        springs:                { type:"array", items: spring_v1, },
        distanceConstraints :   { type:"array", items: distanceConstraint_v1,   },
        revoluteConstraints :   { type:"array", items: revoluteConstraint_v1,   },
        prismaticConstraints :  { type:"array", items: prismaticConstraint_v1,  },
        contactMaterials :      { type:"array", items: contactMaterial_v1,      },
    }
});

