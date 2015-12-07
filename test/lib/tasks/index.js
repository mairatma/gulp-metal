'use strict';

var assert = require('assert');
var bowerDirectory = require('bower-directory');
var childProcess = require('child_process');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var rewire = require('rewire');
var sinon = require('sinon');
var through = require('through2');

var registerTasks = rewire('../../../lib/tasks/index');

describe('Index Tasks', function() {
	before(function() {
		sinon.stub(bowerDirectory, 'sync').returns('test/assets/bower_components');
	});

	beforeEach(function(done) {
		del('test/assets/build').then(function() {
			fs.mkdirSync('test/assets/build');
			fs.writeFileSync('test/assets/build/temp.js', 'var a = 2;');
			gulp.reset();
			done();
		});
	});

	after(function() {
		bowerDirectory.sync.restore();
	});

	describe('Clean', function() {
		it('should clean the build directory', function(done) {
			registerTasks({
				cleanDir: 'test/assets/build'
			});

			gulp.start('clean', function() {
				assert.ok(!fs.existsSync('test/assets/build/temp.js'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				cleanDir: 'test/assets/build',
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:clean', function() {
				assert.ok(!fs.existsSync('test/assets/build/temp.js'));
				done();
			});
		});
	});

	describe('Build', function() {
		it('should clean the build directory', function(done) {
			registerTasks({
				buildDest: 'test/assets/build/globals',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build'
			});

			gulp.start('build', function() {
				assert.ok(!fs.existsSync('test/assets/build/temp.js'));
				done();
			});
		});

		it('should build css files', function(done) {
			registerTasks({
				cssDest: 'test/assets/build',
				cssSrc: 'test/assets/src/*.css',
				cleanDir: 'test/assets/build',
				scssSrc: 'test/assets/src/*.scss'
			});

			gulp.start('build', function() {
				assert.ok(fs.existsSync('test/assets/build/all.css'));
				done();
			});
		});

		it('should only build js files to globals by default', function(done) {
			registerTasks({
				buildDest: 'test/assets/build/globals',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build'
			});

			gulp.start('build', function() {
				assert.ok(!fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(!fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(!fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});

		it('should run the js build tasks specified by the "mainBuildJsTasks" option', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				mainBuildJsTasks: ['build:amd', 'build:jquery']
			});

			gulp.start('build', function() {
				assert.ok(fs.existsSync('test/assets/build/amd'));
				assert.ok(!fs.existsSync('test/assets/build/globals'));
				assert.ok(!fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				buildCss: 'test/assets/build',
				buildDest: 'test/assets/build/globals',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				cssDest: 'test/assets/build',
				cssSrc: 'test/assets/src/**/*.css',
				scssSrc: 'test/assets/src/**/*.scss',
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:build', function() {
				assert.ok(!fs.existsSync('test/assets/build/temp.js'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(fs.existsSync('test/assets/build/all.css'));
				done();
			});
		});
	});

	describe('Build JS', function() {
		it('should not clean the build directory', function(done) {
			registerTasks({
				buildDest: 'test/assets/build/globals',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build'
			});

			gulp.start('build:js', function() {
				assert.ok(fs.existsSync('test/assets/build/temp.js'));
				done();
			});
		});

		it('should only build js files to globals by default', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build'
			});

			gulp.start('build:js', function() {
				assert.ok(!fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(!fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(!fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});

		it('should run the js build tasks specified by the "mainBuildJsTasks" option', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				mainBuildJsTasks: ['build:amd', 'build:jquery']
			});

			gulp.start('build:js', function() {
				assert.ok(fs.existsSync('test/assets/build/amd'));
				assert.ok(!fs.existsSync('test/assets/build/globals'));
				assert.ok(!fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:build:js', function() {
				assert.ok(fs.existsSync('test/assets/build/temp.js'));
				assert.ok(!fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(!fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(!fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});
	});

	describe('Build All', function() {
		it('should clean the build directory', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build'
			});

			gulp.start('build:all', function() {
				assert.ok(!fs.existsSync('test/assets/build/temp.js'));
				done();
			});
		});

		it('should build css files', function(done) {
			registerTasks({
				cssSrc: 'test/assets/src/*.css',
				cssDest: 'test/assets/build',
				scssSrc: 'test/assets/src/*.scss'
			});

			gulp.start('build:all', function() {
				assert.ok(fs.existsSync('test/assets/build/all.css'));
				done();
			});
		});

		it('should build js files to all available build formats', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				mainBuildJsTasks: ['build:amd', 'build:jquery']
			});

			gulp.start('build:all', function() {
				assert.ok(fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				cssSrc: 'test/assets/src/*.css',
				cssDest: 'test/assets/build',
				scssSrc: 'test/assets/src/*.scss',
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:build:all', function() {
				assert.ok(!fs.existsSync('test/assets/build/temp.js'));
				assert.ok(fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(fs.existsSync('test/assets/build/jquery'));
				assert.ok(fs.existsSync('test/assets/build/all.css'));
				done();
			});
		});
	});

	describe('Build All JS', function() {
		it('should not clean the build directory', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build'
			});

			gulp.start('build:all:js', function() {
				assert.ok(fs.existsSync('test/assets/build/temp.js'));
				done();
			});
		});

		it('should build js files to all available build formats', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				mainBuildJsTasks: ['build:amd', 'build:jquery']
			});

			gulp.start('build:all:js', function() {
				assert.ok(fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				buildAmdDest: 'test/assets/build/amd',
				buildDest: 'test/assets/build/globals',
				buildJqueryDest: 'test/assets/build/jquery',
				buildGlobalsJqueryDest: 'test/assets/build/globals-jquery',
				buildSrc: 'test/assets/src/Bar.js',
				cleanDir: 'test/assets/build',
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:build:all:js', function() {
				assert.ok(fs.existsSync('test/assets/build/temp.js'));
				assert.ok(fs.existsSync('test/assets/build/amd'));
				assert.ok(fs.existsSync('test/assets/build/globals'));
				assert.ok(fs.existsSync('test/assets/build/globals-jquery'));
				assert.ok(fs.existsSync('test/assets/build/jquery'));
				done();
			});
		});
	});

	describe('Watch', function() {
		beforeEach(function() {
			sinon.stub(gulp, 'watch');
		});

		afterEach(function() {
			gulp.watch.restore();
		});

		it('should run tasks when source files change', function() {
			registerTasks();
			var doneCallback = sinon.stub();

			var task = gulp.start('watch', doneCallback);
			assert.strictEqual(0, doneCallback.callCount);
			assert.strictEqual(3, gulp.watch.callCount);
			assert.deepEqual(['build:js'], gulp.watch.args[0][1]);
			assert.deepEqual(['soy'], gulp.watch.args[1][1]);
			assert.deepEqual(['css'], gulp.watch.args[2][1]);

			task.stop(null, true);
		});

		it('should use task prefix when it\'s defined', function() {
			registerTasks({
				taskPrefix: 'myPrefix:'
			});
			var doneCallback = sinon.stub();

			var task = gulp.start('myPrefix:watch', doneCallback);
			assert.strictEqual(0, doneCallback.callCount);
			assert.strictEqual(3, gulp.watch.callCount);
			assert.deepEqual(['myPrefix:build:js'], gulp.watch.args[0][1]);
			assert.deepEqual(['myPrefix:soy'], gulp.watch.args[1][1]);
			assert.deepEqual(['myPrefix:css'], gulp.watch.args[2][1]);

			task.stop(null, true);
		});
	});

	describe('Format', function() {
		var stubs = {};

		before(function() {
			stubs.esformatter = getStreamFn();
			sinon.spy(stubs, 'esformatter');
			registerTasks.__set__('esformatter', stubs.esformatter);
		});

		beforeEach(function() {
			stubs.esformatter.callCount = 0;
		});

		it('should call esformatter', function(done) {
			registerTasks();

			gulp.start('format', function() {
				assert.strictEqual(1, stubs.esformatter.callCount);
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:format', function() {
				assert.strictEqual(1, stubs.esformatter.callCount);
				done();
			});
		});
	});

	describe('Lint', function() {
		var stubs = {};

		before(function() {
			stubs.jshint = getStreamFn();
			stubs.jshint.reporter = getStreamFn();
			sinon.spy(stubs, 'jshint');
			registerTasks.__set__('jshint', stubs.jshint);
		});

		beforeEach(function() {
			stubs.jshint.callCount = 0;
		});

		it('should call jshint', function(done) {
			registerTasks();

			gulp.start('lint', function() {
				assert.strictEqual(1, stubs.jshint.callCount);
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:lint', function() {
				assert.strictEqual(1, stubs.jshint.callCount);
				done();
			});
		});
	});

	describe('Docs', function() {
		beforeEach(function() {
			sinon.stub(childProcess, 'execFile').yields();
		});

		afterEach(function() {
			childProcess.execFile.restore();
		});

		it('should call jsdoc cli to generate docs', function(done) {
			registerTasks();

			gulp.start('docs', function() {
				assert.strictEqual(1, childProcess.execFile.callCount);
				done();
			});
		});

		it('should use task prefix when it\'s defined', function(done) {
			registerTasks({
				taskPrefix: 'myPrefix:'
			});

			gulp.start('myPrefix:docs', function() {
				assert.strictEqual(1, childProcess.execFile.callCount);
				done();
			});
		});
	});
});

function getStreamFn() {
	return function() {
		return through.obj(function(file, encoding, callback) {
			this.push(file);
			callback();
		});
	};
}
