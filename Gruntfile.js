
module.exports = function(grunt) {

	// Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

	var config = {
		app: 'app/',
		dist: 'build/',
        tmp:'.tmp/'
	};

	grunt.initConfig({
		config:config,
		watch: {
	        html: {
				files: ['<%= config.app %>/{,*/}*.html'],
				options: {
					livereload: true
				}
			},
			css: {
				files: ['<%= config.app %>/styles/{,*/}*.css'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['<%= config.app %>/javascript/{,*/}*.js'],
				options: {
					livereload: true
				}
			}
	    },
		connect:{
			options:{
				port:8000,
				open: true,
				livereload:35729,
				boundHost:'-all-'
                // hostname:'192.168.0.52' 
                // keepalive:true
			},
			dist:{
				options:{
					middleware: function(connect) {
                        return [
                            connect.static(config.app)
                        ];
                    }
				}
			}
		},
		// Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments:true,
                    collapseBooleanAttributes: true,  //如把checked="true", 优化为checked
                    collapseWhitespace: true,  //去除多余空格
                    removeAttributeQuotes: true,  //特殊情况去除属性的引号
                    removeCommentsFromCDATA: true, //去除cdata中的注释
                    removeEmptyAttributes: true,  //去除空属性
                    removeOptionalTags: true,  //去除可选标签
                    removeRedundantAttributes: true,   //去除多余属性
                    useShortDoctype: true   //用短doctype
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.tmp %>/',
                    src: '{,*/}*.html',
                    dest: '<%= config.dist %>/'
                }]
            }
        },
        copy: {
            img: {
                files: [{
                    expand: true,
                    cwd:'<%=config.app%>/styles/images/',
                    src: '*',
                    dest: '<%=config.dist %>/styles/images/'
                }]
            },
            favicon: {
                files: [{
                    expand:true,
                    cwd:'<%=config.app%>/',
                    src:'favicon.ico',
                    dest:'<%= config.dist%>/'
                }]
            },
            html: {
                files: [{
                    expand:true,
                    cwd:'<%=config.app%>/',
                    src:'**/*.html',
                    dest:'<%=config.tmp%>/'
                }]
            },
            apk: {
                files: [{
                    expand:true,
                    cwd:'<%=config.app%>/res',
                    src:'*.apk',
                    dest:'<%=config.dist%>/res'
                }]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>/'
            },
            html: '<%= config.app %>/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>/', '<%= config.dist %>/styles/']
            },
            html: ['<%= config.tmp %>/{,*/}*.html'],
            css:['<%= config.dist %>/styles/*.css']
        },
        rev: {
            files: {
              src: ['<%=config.dist%>/**/*.{js,css,png,jpg}']
            }
        }
	});
	
	grunt.registerTask('default',['connect:dist', 'watch']);

	grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'useminPrepare',
        'concat:generated',
        'uglify:generated',
        'cssmin:generated',
        'rev',   
        'usemin'
        // 'htmlmin'
    ]);

};