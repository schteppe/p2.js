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
exports.IslandSolver =          require('./solver/IslandSolver')            .IslandSolver;
exports.Island =                require('./solver/IslandSolver')            .Island;
exports.Shape =                 require('./objects/Shape')                  .Shape;
exports.Solver =                require('./solver/Solver')                  .Solver;
exports.Spring =                require('./objects/Body')                   .Spring;
exports.World =                 require('./world/World')                    .World;

// Export gl-matrix. Why shouldn't we?
var glMatrix = require('gl-matrix');
exports.vec2 = glMatrix.vec2;
exports.mat2 = glMatrix.mat2;
