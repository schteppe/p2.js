module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n'
            },
            p2: {
                src:   [// Wrapper start
                        "LICENSE",
                        "src/wrapper/Start.js",
                        "src/p2.js",

                        // Math
                        "src/math/Vec2.js",
                        "src/math/Matrix.js",

                        // Objects
                        "src/objects/Shape.js",
                        "src/objects/Body.js",

                        // Collision
                        "src/collision/Broadphase.js",
                        "src/collision/NaiveBroadphase.js",
                        "src/collision/GridBroadphase.js",

                        // World
                        "src/world/World.js",

                        // Solver
                        "src/solver/Solver.js",
                        "src/solver/GSSolver.js",

                        // Constraints
                        "src/constraints/Equation.js",
                        "src/constraints/ContactEquation.js",

                        //Wrapper end
                        "src/wrapper/End.js"
                ],
                dest: 'build/p2.js'
            }
        },

        uglify : {
            build : {
                src : ['build/p2.js'],
                dest : 'build/p2.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['concat:p2', 'uglify']);

};