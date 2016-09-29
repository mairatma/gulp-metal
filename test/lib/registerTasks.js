'use strict';

var assert = require('assert');
var getGulp = require('../../lib/getGulp');
var registerTasks = require('../../lib/registerTasks');
var sinon = require('sinon');

describe('registerTasks', function() {
	var gulp;
	beforeEach(function() {
		gulp = {
			task: sinon.stub()
		};
		sinon.stub(getGulp, 'get').returns(gulp);
	});

	afterEach(function() {
		getGulp.get.restore();
	});

	it('should register no tasks if no tools are passed', function() {
		registerTasks();
		assert.strictEqual(0, gulp.task.callCount);
	});

	it('should register tasks passed via tool objects', function() {
		var TestTool1 = {
			TASKS: [
				{name: 'tool1-task1', handler: sinon.stub()},
				{name: 'tool1-task2', handler: sinon.stub()}
			]
		};
		var TestTool2 = {
			TASKS: [
				{name: 'tool2-task1', handler: sinon.stub()}
			]
		};
		registerTasks({
			tools: [TestTool1, TestTool2]
		});

		assert.strictEqual(3, gulp.task.callCount);
		assert.strictEqual('tool1-task1', gulp.task.args[0][0]);
		assert.strictEqual('', gulp.task.args[0][1]);
		assert.deepEqual([], gulp.task.args[0][2]);
		assert.ok(gulp.task.args[0][3]);
		gulp.task.args[0][3]();
		assert.strictEqual(1, TestTool1.TASKS[0].handler.callCount);

		assert.strictEqual('tool1-task2', gulp.task.args[1][0]);
		assert.strictEqual('', gulp.task.args[1][1]);
		assert.deepEqual([], gulp.task.args[1][2]);
		assert.ok(gulp.task.args[1][3]);
		gulp.task.args[1][3]();
		assert.strictEqual(1, TestTool1.TASKS[1].handler.callCount);

		assert.strictEqual('tool2-task1', gulp.task.args[2][0]);
		assert.strictEqual('', gulp.task.args[2][1]);
		assert.deepEqual([], gulp.task.args[2][2]);
		assert.ok(gulp.task.args[2][3]);
		gulp.task.args[2][3]();
		assert.strictEqual(1, TestTool2.TASKS[0].handler.callCount);
	});

	it('should register tasks passed on their own', function() {
		var handler1 = sinon.stub();
		var handler2 = sinon.stub();
		registerTasks({
			tools: [
				{name: 'task1', handler: handler1},
				{name: 'task2', handler: handler2}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('task1', gulp.task.args[0][0]);
		assert.strictEqual('', gulp.task.args[0][1]);
		assert.deepEqual([], gulp.task.args[0][2]);
		assert.ok(gulp.task.args[0][3]);
		gulp.task.args[0][3]();
		assert.strictEqual(1, handler1.callCount);

		assert.strictEqual('task2', gulp.task.args[1][0]);
		assert.strictEqual('', gulp.task.args[1][1]);
		assert.deepEqual([], gulp.task.args[1][2]);
		assert.ok(gulp.task.args[1][3]);
		gulp.task.args[1][3]();
		assert.strictEqual(1, handler2.callCount);
	});

	it('should throw error if invalid tasks are given', function() {
		assert.throws(function() {
			registerTasks({
				tools: [1, 2]
			});
		});
	});

	it('should throw error if a task is given without a name', function() {
		assert.throws(function() {
			registerTasks({
				tools: [{
					TASKS: [
						{handler: sinon.stub()}
					]
				}]
			});
		});
	});

	it('should throw error if a task is given without a handler', function() {
		assert.throws(function() {
			registerTasks({
				tools: [{name: 'task1'}]
			});
		});
	});

	it('should pass config to task handlers', function() {
		var handler = sinon.stub();
		var config = {
			tools: [
				{name: 'task1', handler: handler}
			]
		};
		registerTasks(config);

		gulp.task.args[0][3]();
		assert.strictEqual(1, handler.callCount);
		assert.deepEqual(config, handler.args[0][0]);
	});

	it('should merge config with specific config data for each task', function() {
		var handler1 = sinon.stub();
		var handler2 = sinon.stub();
		var config = {
			someData: 'original',
			tools: [
				[{name: 'task1', handler: handler1}, {config: {someData: 'new1'}}],
				[{name: 'task2', handler: handler2}, {config: {someData: 'new2'}}]
			]
		};
		registerTasks(config);

		gulp.task.args[0][3]();
		assert.strictEqual(1, handler1.callCount);
		assert.notStrictEqual(config, handler1.args[0][0]);
		assert.strictEqual('new1', handler1.args[0][0].someData);

		gulp.task.args[1][3]();
		assert.strictEqual(1, handler2.callCount);
		assert.notStrictEqual(config, handler2.args[0][0]);
		assert.strictEqual('new2', handler2.args[0][0].someData);
	});

	it('should register tasks with their full names when requested', function() {
		registerTasks({
			tools: [
				[
					{name: 'task1', fullName: 'full:task1', handler: sinon.stub()},
					{useFullName: true}
				],
				{name: 'task2', fullName: 'full:task2', handler: sinon.stub()}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('full:task1', gulp.task.args[0][0]);
		assert.strictEqual('task2', gulp.task.args[1][0]);
	});

	it('should register tasks coming from TASKS with their full names when requested', function() {
		registerTasks({
			tools: [
				[
					{
						TASKS: [
							{name: 'task1', fullName: 'full:task1', handler: sinon.stub()},
						]
					},
					{useFullName: true}
				],
				{name: 'task2', fullName: 'full:task2', handler: sinon.stub()}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('full:task1', gulp.task.args[0][0]);
		assert.strictEqual('task2', gulp.task.args[1][0]);
	});

	it('should register tasks with prefix when requested', function() {
		registerTasks({
			tools: [
				[
					{name: 'task1', handler: sinon.stub()},
					{prefix: 'prefix:'}
				],
				{name: 'task2', handler: sinon.stub()}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('prefix:task1', gulp.task.args[0][0]);
		assert.strictEqual('task2', gulp.task.args[1][0]);
	});

	it('should register tasks with their task dependencies when requested', function() {
		registerTasks({
			tools: [
				[
					{name: 'task1', handler: sinon.stub()},
					{deps: ['task2']}
				],
				{name: 'task2', handler: sinon.stub()}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('task1', gulp.task.args[0][0]);
		assert.strictEqual('', gulp.task.args[0][1]);
		assert.deepEqual(['task2'], gulp.task.args[0][2]);
		assert.strictEqual('task2', gulp.task.args[1][0]);
		assert.strictEqual('', gulp.task.args[1][1]);
		assert.deepEqual([], gulp.task.args[1][2]);
	});

	it('should register tasks with their help descriptions', function() {
		registerTasks({
			tools: [
				{name: 'task1', help: 'help1', handler: sinon.stub()},
				{name: 'task2', help: 'help2', handler: sinon.stub()}
			]
		});

		assert.strictEqual(2, gulp.task.callCount);
		assert.strictEqual('task1', gulp.task.args[0][0]);
		assert.strictEqual('help1', gulp.task.args[0][1]);
		assert.strictEqual('task2', gulp.task.args[1][0]);
		assert.strictEqual('help2', gulp.task.args[1][1]);
	});
});
