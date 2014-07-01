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
                        standalone : "p2"
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
                src : ['build/p2.demo.js'],
                dest : 'build/p2.demo.min.js'
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
            test: {
                files: ['src/**/*', 'test/**/*'],
                tasks: [
                    'test'
                ]
            },
        },

        concat: {
            debug: {
                src: ['demos/js/pixi.js', 'demos/js/jquery.js', 'demos/js/bootstrap.min.js', 'demos/js/Demo.js', 'demos/js/PixiDemo.js'],
                dest: 'build/p2.demo.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['grabVec2','browserify','webworkerify','concat','uglify','addLicense']);
    grunt.registerTask('test', ['nodeunit']);

    grunt.registerTask('webworkerify','Fixes the browserify bundle so it works in Web Workers',function(){
        var src = fs.readFileSync("build/p2.js");
        fs.writeFileSync("build/p2.js",src.toString().replace("global.p2","self.p2"));
    });

    grunt.registerTask('addLicense','Adds the LICENSE to the top of the built files',function(){
        var text = fs.readFileSync("LICENSE").toString();

        var dev = fs.readFileSync("build/p2.js").toString();
        var min = fs.readFileSync("build/p2.min.js").toString();

        fs.writeFileSync("build/p2.js",text+"\n"+dev);
        fs.writeFileSync("build/p2.min.js",text+"\n"+min);
    });

    grunt.registerTask('grabVec2','Grabs the vec2 class from the gl-matrix library.',function(){
        var common = fs.readFileSync("node_modules/gl-matrix/src/gl-matrix/common.js").toString();
        var vec2 = fs.readFileSync("node_modules/gl-matrix/src/gl-matrix/vec2.js").toString();
        fs.writeFileSync("build/vec2.js",common+'\n'+vec2);
    });
};
