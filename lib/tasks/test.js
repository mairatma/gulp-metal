'use strict';

var fs = require('fs');
var gulp = require('gulp');
var karmaConfig = require('karma/lib/config');
var karmaFirefoxLauncher = require('karma-firefox-launcher');
var karmaSafariLauncher = require('karma-safari-launcher');
var normalizeOptions = require('../options');
var openFile = require('open');
var path = require('path');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'test', [taskPrefix + 'soy'], function(done) {
		runKarma(options, {singleRun: true}, function() {
			done();
		});
	});

	gulp.task(taskPrefix + 'test:coverage', [taskPrefix + 'soy'], function(done) {
		var configFile = 'metal-karma-config/';
		configFile += options.noSoy ? 'no-soy-coverage' : 'coverage';
		runKarma(
			options,
			{
				configFile: require.resolve(configFile),
				singleRun: true
			},
			function() {
				done();
			},
			'coverage'
		);
	});

	gulp.task(taskPrefix + 'test:coverage:open', [taskPrefix + 'test:coverage'], function(done) {
		openFile(path.resolve('coverage/lcov/lcov-report/index.html'));
		done();
	});

	gulp.task(taskPrefix + 'test:browsers', [taskPrefix + 'soy'], function(done) {
		var plugins = [karmaFirefoxLauncher, karmaSafariLauncher];
		if (process.platform !== 'win32') {
			// Windows breaks when requiring "karma-ievms", and we don't really need
			// it there, so only require it when not on windows.
			plugins.push(require('karma-ievms'));
		}
		runKarma(
			options,
			{
				browsers: options.testBrowsers,
				plugins: plugins,
				singleRun: true
			},
			done,
			'browsers'
		);
	});

	gulp.task(taskPrefix + 'test:watch', [taskPrefix + 'soy'], function(done) {
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);

		runKarma(options, {}, done);
	});
};

// Private helpers
// ===============

function runKarma(options, config, done, opt_suffix) {
	var suffix = opt_suffix ? '-' + opt_suffix : '';
	var configFile = path.resolve('karma' + suffix + '.conf.js');
	var configGenericFile = path.resolve('karma.conf.js');
	if (fs.existsSync(configFile)) {
		config.configFile = configFile;
	} else if (fs.existsSync(configGenericFile)) {
		config.configFile = configGenericFile;
	} else if (!config.configFile) {
		configFile = 'metal-karma-config';
		configFile += options.noSoy ? '/no-soy' : '';
		config.configFile = require.resolve(configFile);
	}

	if (!config.basePath) {
		config.basePath = process.cwd();
	}

	if (config.plugins) {
		var configObj = new karmaConfig.Config();
		require(config.configFile)(configObj);

		var plugins = config.plugins;
		delete config.plugins;

		configObj.set(config);
		configObj.plugins = (configObj.plugins || []).concat(plugins);
		config = configObj;
	}
	new options.karma.Server(config, done).start();
}
