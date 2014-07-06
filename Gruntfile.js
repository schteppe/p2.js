var fs = require('fs');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify : {
            core : {
                src : ["src/p2.js"],
                dest : 'build/p2.js',
                options:{
                    bundleOptions : {
                        standalone : "p2",
                        insertGlobals: true
                    }
                }
            }
        },

        uglify : {
            build: {
                src : ['build/p2.js'],
                dest : 'build/p2.min.js'
            },
            demo: {
                src : ['build/p2.renderer.js'],
                dest : 'build/p2.renderer.min.js'
            }
        },

        nodeunit: {
            all: ['test/**/*.js'],
        },

        jshint: {
            all: ['src/**/*.js'],
            options:{
                jshintrc: '.jshintrc',
                force: true // Do not fail the task
            }
        },

        watch: {
            options: {
                nospawn: false
            },
            source: {
                files: 'src/**/*',
                tasks: [
                    'default'
                ]
            },
            renderer: {
                files: 'demos/js/*Renderer.js',
                tasks: [
                    'concat:renderer'
                ]
            },
            test: {
                files: ['src/**/*', 'test/**/*'],
                tasks: [
                    'test'
                ]
            },
        },

        concat: {
            renderer: {
                src: ['demos/js/pixi.js', 'demos/js/dat.gui.js', 'demos/js/Renderer.js', 'demos/js/WebGLRenderer.js'],
                dest: 'build/p2.renderer.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['test','jshint','browserify','concat','uglify','addLicense']);
    grunt.registerTask('test', ['nodeunit']);

    grunt.registerTask('addLicense','Adds the LICENSE to the top of the built files',function(){
        var text = fs.readFileSync("LICENSE").toString();

        var dev = fs.readFileSync("build/p2.js").toString();
        var min = fs.readFileSync("build/p2.min.js").toString();

        fs.writeFileSync("build/p2.js",text+"\n"+dev);
        fs.writeFileSync("build/p2.min.js",text+"\n"+min);
    });
};
