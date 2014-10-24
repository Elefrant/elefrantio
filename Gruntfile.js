'use strict';

require('./app/core/Initialize');

// Modules dependencies
var join = require('path').join;

// Path for files
var paths = {
    js: [
        '*.js',
        'app/**/*.js',
        'test/**/*.js',
        'templates/docs/basic/js/*.js'
    ],
    css: [
        'templates/docs/basic/css/*.css'
    ]
};

module.exports = function (grunt) {
    // Load config
    var config = require('./app/core/Config')();

    // Show time of executed tasks
    if (config.env !== 'production') {
        require('time-grunt')(grunt);
    }

    var pkg = grunt.file.readJSON('package.json');

    // Create folders
    grunt.file.mkdir(join(config.system.root, 'logs'));

    grunt.initConfig({
        pkg: pkg,

        // Watch changes in files
        watch: {
            js: {
                files: paths.js,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            }
        },

        // Check js syntax and validate
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true
                }
            }
        },

        // Check css syntax and validate
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            all: {
                src: paths.css
            }
        },

        // Clean logs and tmp files
        clean: [
            'logs/**/*',
            '.bower-registry',
            '.bower-cache'
        ],

        // Dev Documentation configuration.
        docco: {
            dev: {
                src: [
                    'app/core/**/*.js',
                    'app/lib/**/*.js'
                ],
                options: {
                    dest: 'docs/'
                }
            }
        },

        // Check version of elefrant
        github_version: {
            all: {
                options: {
                    username: 'Elefrant',
                    repository: 'elefrant',
                    version: pkg.elefrant
                }
            }
        },

        // Set a default enviroment
        env: {
            test: {
                NODE_ENV: 'test'
            },
            prod: {
                NODE_ENV: 'production'
            }
        },

        // Init system
        forever: {
            server: {
                options: {
                    index: 'cluster.js',
                    command: 'node --stack_size=8192 --max-old-space-size=8192'
                }
            }
        },

        // Init system
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],
                    ignore: ['node_modules/**'],
                    ext: 'js,coffee',
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    env: {
                        PORT: config.server.port
                    },
                    cwd: __dirname
                }
            },
            seed: {
                script: 'app/core/database/Seed.js',
            }
        },

        // Concurrent tasks
        concurrent: {
            dev: {
                tasks: ['nodemon:dev', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            prod: {
                tasks: ['forever:server:restart', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        // Mocha test
        mochaTest: {
            options: {
                reporter: 'spec',
                require: 'server.js'
            },
            src: ['test/mocha/**/*.js']
        },

        // Show notifications
        notify: {
            watch: {
                options: {
                    title: 'Task Complete', // optional
                    message: 'Uglify finished running', //required
                }
            },
            server: {
                options: {
                    message: 'Server is ready!'
                }
            }
        }

    }); // grunt.initConfig

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Default task(s).
    if (process.env.NODE_ENV === 'production') {
        grunt.registerTask('default', ['clean', 'github_version', 'concurrent:prod']);
    } else {
        grunt.registerTask('default', ['clean', 'github_version', 'jshint', 'csslint', 'concurrent:dev']);
    }

    // Production task
    grunt.registerTask('production', ['clean', 'github_version', 'env:prod', 'concurrent:prod']);

    //Test task.
    grunt.registerTask('test', ['clean', 'github_version', 'env:test', 'mochaTest']);

    //Generate documentation task.
    grunt.registerTask('doc', ['jshint', 'csslint', 'docco']);

    //Generate dummy database task.
    grunt.registerTask('seed', ['jshint', 'nodemon:seed']);

};
