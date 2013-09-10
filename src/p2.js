/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 p2.js authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
