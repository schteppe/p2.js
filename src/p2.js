// Export p2 classes
var p2 = module.exports = {
    AABB :                          require('./collision/AABB'),
    AngleLockEquation :             require('./equations/AngleLockEquation'),
    Body :                          require('./objects/Body'),
    Broadphase :                    require('./collision/Broadphase'),
    Capsule :                       require('./shapes/Capsule'),
    Circle :                        require('./shapes/Circle'),
    Constraint :                    require('./constraints/Constraint'),
    ContactEquation :               require('./equations/ContactEquation'),
    ContactEquationPool :           require('./utils/ContactEquationPool'),
    ContactMaterial :               require('./material/ContactMaterial'),
    Convex :                        require('./shapes/Convex'),
    DistanceConstraint :            require('./constraints/DistanceConstraint'),
    Equation :                      require('./equations/Equation'),
    EventEmitter :                  require('./events/EventEmitter'),
    FrictionEquation :              require('./equations/FrictionEquation'),
    FrictionEquationPool :          require('./utils/FrictionEquationPool'),
    GearConstraint :                require('./constraints/GearConstraint'),
    GSSolver :                      require('./solver/GSSolver'),
    Heightfield :                   require('./shapes/Heightfield'),
    Line :                          require('./shapes/Line'),
    LockConstraint :                require('./constraints/LockConstraint'),
    Material :                      require('./material/Material'),
    Narrowphase :                   require('./collision/Narrowphase'),
    NaiveBroadphase :               require('./collision/NaiveBroadphase'),
    Particle :                      require('./shapes/Particle'),
    Plane :                         require('./shapes/Plane'),
    Pool :                          require('./utils/Pool'),
    RevoluteConstraint :            require('./constraints/RevoluteConstraint'),
    PrismaticConstraint :           require('./constraints/PrismaticConstraint'),
    Ray :                           require('./collision/Ray'),
    RaycastResult :                 require('./collision/RaycastResult'),
    Box :                           require('./shapes/Box'),
    RotationalVelocityEquation :    require('./equations/RotationalVelocityEquation'),
    SAPBroadphase :                 require('./collision/SAPBroadphase'),
    Shape :                         require('./shapes/Shape'),
    Solver :                        require('./solver/Solver'),
    Spring :                        require('./objects/Spring'),
    TopDownVehicle :                require('./objects/TopDownVehicle'),
    LinearSpring :                  require('./objects/LinearSpring'),
    RotationalSpring :              require('./objects/RotationalSpring'),
    Utils :                         require('./utils/Utils'),
    World :                         require('./world/World'),
    vec2 :                          require('./math/vec2'),
    version :                       require('../package.json').version,
};

Object.defineProperty(p2, 'Rectangle', {
    get: function() {
        console.warn('The Rectangle class has been renamed to Box.');
        return this.Box;
    }
});