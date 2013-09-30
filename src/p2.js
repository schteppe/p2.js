// Export p2 classes
module.exports = {
    Body :                  require('./objects/Body'),
    Broadphase :            require('./collision/Broadphase'),
    Capsule :               require('./shapes/Capsule'),
    Circle :                require('./shapes/Circle'),
    Constraint :            require('./constraints/Constraint'),
    ContactEquation :       require('./constraints/ContactEquation'),
    Convex :                require('./shapes/Convex'),
    DistanceConstraint :    require('./constraints/DistanceConstraint'),
    Equation :              require('./constraints/Equation'),
    EventEmitter :          require('./events/EventEmitter'),
    FrictionEquation :      require('./constraints/FrictionEquation'),
    GridBroadphase :        require('./collision/GridBroadphase'),
    GSSolver :              require('./solver/GSSolver'),
    Island :                require('./solver/IslandSolver'),
    IslandSolver :          require('./solver/IslandSolver'),
    Line :                  require('./shapes/Line'),
    NaiveBroadphase :       require('./collision/NaiveBroadphase'),
    Particle :              require('./shapes/Particle'),
    Plane :                 require('./shapes/Plane'),
    PointToPointConstraint :require('./constraints/PointToPointConstraint'),
    PrismaticConstraint :   require('./constraints/PrismaticConstraint'),
    Rectangle :             require('./shapes/Rectangle'),
    Shape :                 require('./shapes/Shape'),
    Solver :                require('./solver/Solver'),
    Spring :                require('./objects/Spring'),
    World :                 require('./world/World'),
    vec2 :                  require('./math/vec2'),
    version :               require('../package.json').version,
};
