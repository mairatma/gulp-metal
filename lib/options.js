'use strict';

var karma = require('karma');

function normalizeOptions(options) {
	var codeGlobs = ['src/**/*.js', '!src/**/*.soy.js', 'test/**/*.js', 'gulpfile.js'];

	options = options || {};
	options.bundleFileName = options.bundleFileName || 'metal.js';
	options.buildDest = options.buildDest || 'build';
	options.buildSrc = options.buildSrc || 'src/**/*.js';
	options.formatGlobs = options.formatGlobs || codeGlobs;
	options.karma = options.karma || karma;
	options.lintGlobs = options.lintGlobs || codeGlobs;
	options.noSoy = options.noSoy || false;
	options.soyDest = options.soyDest || 'src';
	options.soyLocales = options.soyLocales;
	options.soyMessageFilePathFormat = options.soyMessageFilePathFormat;
	options.soySrc = options.soySrc || 'src/**/*.soy';
	options.taskPrefix = options.taskPrefix || '';
	options.testBrowsers = options.testBrowsers ||
		['Chrome', 'Firefox', 'Safari', 'IE9 - Win7', 'IE10 - Win7', 'IE11 - Win7'];

	return options;
}

module.exports = normalizeOptions;
