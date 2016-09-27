'use strict';

var gulp = require('gulp');

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
	} else if (tool.name) {
		return [tool];
	} else {
		throw new Error(
			'Invalid tool passed to "registerTasks". Check out gulp-metal\'s ' +
			'README page for valid tool formats: http://npmjs.com/package/gulp-metal.'
		);
	}
}

function registerSingleTask(gulp, config, task) {
	assertValidTask(task);
	gulp.task(task.name, task.handler(config));
}

module.exports = function(config) {
	config = config || {};
	gulp = config.gulp || gulp;
	var tools = config.tools || [];
	for (var i = 0; i < tools.length; i++) {
		var tasks = getToolTasks(tools[i]);
		for (var j = 0; j < tasks.length; j++) {
			registerSingleTask(gulp, config, tasks[j]);
		}
	}
};
