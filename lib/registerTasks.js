'use strict';

var getGulp = require('./getGulp');
var gulp = require('gulp');
var merge = require('merge');

/**
 * Checks if the given task is valid, throwing an error if it isn't. Valid
 * tasks should be objects with at least a "name" and a "handler".
 * @param {*} task
 */
function assertValidTask(task) {
	if (!task.name) {
		throw new Error(
			'Invalid task passed to "registerTasks". A task must have a name.'
		);
	}
	if (!task.handler) {
		throw new Error(
			'Invalid task passed to "registerTasks". A task must have a handler.'
		);
	}
}

/**
 * Gets the tasks provided by the given tool.
 * @param {!Object} tool
 * @return {!Array<!Object>}
 */
function getToolTasks(tool) {
	if (tool.TASKS) {
		return tool.TASKS;
	} else {
		return [tool];
	}
}

/**
 * Registers a single task via gulp.
 * @param {!Object} gulp The gulp instance to be used.
 * @param {!Object} config
 * @param {!Object} taskConfig
 * @param {!Object} task
 */
function registerSingleTask(gulp, config, taskConfig, task) {
	assertValidTask(task);

	var name = taskConfig.useFullName && task.fullName ? task.fullName : task.name;
	if (taskConfig.prefix) {
		name = taskConfig.prefix + name;
	}

	config = merge({}, config, taskConfig.config);
	var wrapper = task.handler.length > 1 ? wrapAsync : wrapSync;
	var handler = wrapper(task.handler, config);
	gulp.task(name, task.help || '', taskConfig.deps || [], handler);
}

/**
 * Wraps the given handler as an async gulp task. For gulp to recognize a task
 * as async, it needs to be a function that receives the "done" callback as the
 * first parameter.
 * @param {!function()} handler
 * @param {!Object} config
 * @return {!function()}
 */
function wrapAsync(handler, config) {
	return function(done) {
		return handler(config, done);
	};
}

/**
 * Wraps the given handler as a synchronous gulp task. For gulp to recognize a
 * task as synchronous, it needs to be a function that receives no arguments.
 * @param {!function()} handler
 * @param {!Object} config
 * @return {!function()}
 */
function wrapSync(handler, config) {
	return function() {
		return handler(config);
	};
}

/**
 * Registers all tasks specified in the given config object via gulp.
 * @param {!Object} config
 */
module.exports = function(config) {
	config = config || {};
	gulp = getGulp.get(config.gulp || gulp);
	var tools = config.tools || [];
	for (var i = 0; i < tools.length; i++) {
		var toolConfig = {};
		var tool = tools[i];
		if (Array.isArray(tool)) {
			toolConfig = tool[1];
			tool = tool[0];
		}
		var tasks = getToolTasks(tool);
		for (var j = 0; j < tasks.length; j++) {
			registerSingleTask(gulp, config, toolConfig, tasks[j]);
		}
	}
};
