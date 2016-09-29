'use strict';

var getGulp = require('./getGulp');
var gulp = require('gulp');
var merge = require('merge');

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

function getToolTasks(tool) {
	if (tool.TASKS) {
		return tool.TASKS;
	} else {
		return [tool];
	}
}

function registerSingleTask(gulp, config, task) {
	var taskConfig = {};
	if (Array.isArray(task)) {
		taskConfig = task[1];
		config = merge({}, config, task[1].config);
		task = task[0];
	}
	assertValidTask(task);

	var name = taskConfig.useFullName && task.fullName ? task.fullName : task.name;
	if (taskConfig.prefix) {
		name = taskConfig.prefix + name;
	}

	var wrapper = task.handler.length > 1 ? wrapAsync : wrapSync;
	var handler = wrapper(task.handler, config);
	gulp.task(name, task.help || '', taskConfig.deps || [], handler);
}

function wrapAsync(handler, config) {
	return function(done) {
		return handler(config, done);
	};
}

function wrapSync(handler, config) {
	return function() {
		return handler(config);
	};
}

module.exports = function(config) {
	config = config || {};
	gulp = getGulp.get(config.gulp || gulp);
	var tools = config.tools || [];
	for (var i = 0; i < tools.length; i++) {
		var tasks = getToolTasks(tools[i]);
		for (var j = 0; j < tasks.length; j++) {
			registerSingleTask(gulp, config, tasks[j]);
		}
	}
};
