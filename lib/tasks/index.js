'use strict';

var babelify = require('babelify');
var babelPresetMetal = require('babel-preset-metal');
var browserify = require('browserify');
var del = require('del');
var esformatter = require('gulp-esformatter');
var globby = require('globby');
var gulp = require('gulp');
var handleError = require('../handleError');
var jshint = require('gulp-jshint');
var normalizeOptions = require('../options');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var soyTasks = require('./soy');
var testTasks = require('./test');
var through = require('through2');
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
		runSequence(taskPrefix + 'clean', taskPrefix + 'soy', taskPrefix + 'build:js', done);
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
	var bundledStream = through()
		.pipe(source(options.bundleFileName))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(options.buildDest));

	globby(options.buildSrc).then(function(entries) {
		var browserifyOpts = {
			debug: true,
			entries: entries,
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
		browserify(browserifyOpts)
			.bundle()
			.on('error', handleError.bind(bundledStream))
			.pipe(bundledStream);
	}).catch(function(err) {
		handleError.call(bundledStream, err);
  });

	return bundledStream;
}
