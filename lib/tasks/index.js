'use strict';

var babelify = require('babelify');
var babelPresetMetal = require('babel-preset-metal');
var browserify = require('browserify');
var del = require('del');
var esformatter = require('gulp-esformatter');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var normalizeOptions = require('../options');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var soyTasks = require('./soy');
var testTasks = require('./test');
var watchify = require('watchify');

module.exports = function(options) {
	options = normalizeOptions(options);
	soyTasks(options);
	testTasks(options);

	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'clean', function(done) {
		del(options.buildDest).then(function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'build', function(done) {
		runSequence(taskPrefix + 'clean', taskPrefix + 'soy', done);
	});

	gulp.task(taskPrefix + 'build:js', function() {
		return browserifyFn(options);
	});

	gulp.task(taskPrefix + 'watch', function(done) { // jshint ignore:line
		browserifyFn(options, true);
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);
	});

	gulp.task(taskPrefix + 'build:watch', [taskPrefix + 'build'], function(done) { // jshint ignore:line
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
};

function browserifyFn(options, opt_watch) {
	var browserifyOpts = {
		transform: [
			[babelify, {
				presets: [babelPresetMetal]
			}]
		]
	};
	if (opt_watch) {
		browserifyOpts.cache = {};
		browserifyOpts.packageCache = {};
		browserifyOpts.plugin = [watchify];
	}
	return browserify(options.buildSrc, browserifyOpts)
		.bundle()
		.pipe(source(options.bundleFileName))
		.pipe(gulp.dest(options.buildDest));
}
