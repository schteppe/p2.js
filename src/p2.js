// Export p2 classes
exports.Body =                  require('./objects/Body')                   .Body;
exports.Broadphase =            require('./collision/Broadphase')           .Broadphase;
exports.Circle =                require('./objects/Shape')                  .Circle;
exports.Constraint =            require('./constraints/Constraint')         .Constraint;
exports.ContactEquation =       require('./constraints/ContactEquation')    .ContactEquation;
exports.DistanceConstraint=     require('./constraints/DistanceConstraint') .DistanceConstraint;
exports.Equation =              require('./constraints/Equation')           .Equation;
exports.EventEmitter =          require('./events/EventEmitter')            .EventEmitter;
exports.GridBroadphase =        require('./collision/GridBroadphase')       .GridBroadphase;
exports.GSSolver =              require('./solver/GSSolver')                .GSSolver;
exports.NaiveBroadphase =       require('./collision/NaiveBroadphase')      .NaiveBroadphase;
exports.Plane =                 require('./objects/Shape')                  .Plane;
exports.Particle =              require('./objects/Shape')                  .Particle;
exports.IslandSolver =          require('./solver/IslandSolver')            .IslandSolver;
exports.Island =                require('./solver/IslandSolver')            .Island;
exports.Shape =                 require('./objects/Shape')                  .Shape;
exports.Solver =                require('./solver/Solver')                  .Solver;
exports.Spring =                require('./objects/Body')                   .Spring;
exports.World =                 require('./world/World')                    .World;

// Export the gl-matrix stuff we already use internally. Why shouldn't we? It's already in the bundle.
exports.vec2 = require('./math/vec2');
exports.mat2 = require('./math/mat2');
