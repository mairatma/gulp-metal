'use strict';

var amdTasks = require('./amd');
var childProcess = require('child_process');
var cssTasks = require('./css');
var esformatter = require('gulp-esformatter');
var eslint = require('gulp-eslint');
var globalsTasks = require('./globals');
var globExpand = require('glob-expand');
var jqueryTasks = require('./jquery');
var jshint = require('gulp-jshint');
var del = require('del');
var rename = require('gulp-rename');
var normalizeOptions = require('../options');
var soyTasks = require('./soy');
var testTasks = require('./test');
var uglify = require('gulp-uglify');

module.exports = function(options) {
	options = normalizeOptions(options);
	amdTasks(options);
	cssTasks(options);
	globalsTasks(options);
	jqueryTasks(options);
	soyTasks(options);
	testTasks(options);

	var gulp = options.gulp;
	var taskPrefix = options.taskPrefix;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task(taskPrefix + 'clean', function(done) {
		del(options.cleanDir).then(function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'uglify', function() {
		return gulp.src(options.uglifySrc)
			.pipe(rename({
				suffix: '-min'
			}))
			.pipe(uglify({
				compress: {
					drop_console: true
				},
				preserveComments: 'some'
			}))
			.pipe(gulp.dest(function(file) {
				return file.base;
			}));
	});

	gulp.task(taskPrefix + 'build', function(done) {
		runSequence(taskPrefix + 'clean', [taskPrefix + 'css', taskPrefix + 'build:js'], taskPrefix + 'uglify', done);
	});

	gulp.task(taskPrefix + 'build:js', [taskPrefix + 'soy'], function(done) {
		runSequence(options.mainBuildJsTasks, done);
	});

	gulp.task(taskPrefix + 'build:all', function(done) {
		runSequence(taskPrefix + 'clean', [taskPrefix + 'css', taskPrefix + 'build:all:js'], done);
	});

	gulp.task(taskPrefix + 'build:all:js', [taskPrefix + 'soy'], function(done) {
		runSequence(
			[
				taskPrefix + 'build:globals:js',
				taskPrefix + 'build:globals:jquery:js',
				taskPrefix + 'build:jquery:js',
				taskPrefix + 'build:amd:js',
				taskPrefix + 'build:amd:jquery:js'
			],
			done
		);
	});

	gulp.task(taskPrefix + 'watch', function(done) { // eslint-disable-line
		gulp.watch(options.buildSrc, options.mainBuildJsTasks);
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);
		gulp.watch(options.scssSrc, [taskPrefix + 'css']);
		gulp.watch(options.cssSrc, [taskPrefix + 'css']);
	});

	gulp.task(taskPrefix + 'build:watch', [taskPrefix + 'build'], function(done) { // eslint-disable-line
		runSequence(taskPrefix + 'watch', done);
	});

	gulp.task(taskPrefix + 'format', function() {
	  var gulpOpts = {
	    base: process.cwd()
	  };
	  return gulp.src(options.formatGlobs, gulpOpts)
		.pipe(esformatter({
			indent: {
				value: '	'
			}
		}))
		.pipe(gulp.dest(process.cwd()));
	});

	gulp.task(taskPrefix + 'lint', function() {
	  return gulp.src(options.lintGlobs)
	    .pipe(jshint())
	    .pipe(jshint.reporter(require('jshint-stylish')));
	});

	gulp.task(taskPrefix + 'lint:eslint', function() {
	  return gulp.src(options.lintGlobs)
	    .pipe(eslint())
			.pipe(eslint.format());
	});

	gulp.task(taskPrefix + 'docs', function(done) {
		del('docs').then(function() {
			var srcBlobs = globExpand({filter: 'isFile', cwd: process.cwd()}, options.buildSrc);
			var program = childProcess.execFile(
				require.resolve('jsdoc/jsdoc.js'),
				['-c', options.jsDocConfFile].concat(srcBlobs),
				{
					cwd: process.cwd(),
					env: process.env
				},
				function() {
					done();
				}
			);
			program.stdin.pipe(process.stdin);
			program.stdout.pipe(process.stdout);
			program.stderr.pipe(process.stderr);
		});
	});
};
