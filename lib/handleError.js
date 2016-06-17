'use strict';

var gutil = require('gulp-util');

function handleError(error, source) {
	var message = error.messageFormatted ? error.messageFormatted : error.toString();
	source = source || error.plugin;
	console.error(new gutil.PluginError(source || 'metal', message).toString());

	this && this.emit && this.emit('end'); // jshint ignore:line
}

module.exports = handleError;
