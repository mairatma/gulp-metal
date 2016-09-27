'use strict';

var assert = require('assert');
var gulp = require('gulp');
var registerTasks = require('../../lib/registerTasks');
var sinon = require('sinon');

describe('registerTasks', function() {
	beforeEach(function() {
		sinon.stub(gulp, 'task');
	});

	afterEach(function() {
		gulp.task.restore();
	});

	it('should register no tasks if no tools are passed', function() {
		registerTasks();
		assert.strictEqual(0, gulp.task.callCount);
	});

	it('should throw error if invalid tools are given', function() {
		assert.throws(function() {
			registerTasks({
				tools: [1, 2]
			});
		});
	});

	it('should register tasks passed via tool objects', function() {
		var TestTool1 = {
			TASKS: [
				{name: 'tool1-task1', handler: sinon.stub().returns(1)},
				{name: 'tool1-task2', handler: sinon.stub().returns(2)}
			]
		};
		var TestTool2 = {
			TASKS: [
				{name: 'tool2-task1', handler: sinon.stub().returns(3)}
			]
		};
		registerTasks({
			tools: [TestTool1, TestTool2]
		});

		assert.strictEqual(3, gulp.task.callCount);
		assert.strictEqual('tool1-task1', gulp.task.args[0][0]);
		assert.strictEqual(1, gulp.task.args[0][1]);
		assert.strictEqual('tool1-task2', gulp.task.args[1][0]);
		assert.strictEqual(2, gulp.task.args[1][1]);
		assert.strictEqual('tool2-task1', gulp.task.args[2][0]);
		assert.strictEqual(3, gulp.task.args[2][1]);
	});

	it('should register tasks passed on their own', function() {
		registerTasks({
			tools: [
				{name: 'task1', handler: sinon.stub().returns(1)},
				{name: 'task2', handler: sinon.stub().returns(2)}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('task1', gulp.task.args[0][0]);
		assert.strictEqual(1, gulp.task.args[0][1]);
		assert.strictEqual('task2', gulp.task.args[1][0]);
		assert.strictEqual(2, gulp.task.args[1][1]);
	});

	it('should throw error if a invalid task is given without a name', function() {
		assert.throws(function() {
			registerTasks({
				tools: [{
					TASKS: [
						{handler: sinon.stub().returns(1)}
					]
				}]
			});
		});
	});

	it('should throw error if a invalid task is given without a handler', function() {
		assert.throws(function() {
			registerTasks({
				tools: [{name: 'task1'}]
			});
		});
	});
});
