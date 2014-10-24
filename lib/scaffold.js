'use strict';

var fs = require('fs'),
	shell = require('shelljs'),
	util = require('elefrant-util'),
	chalk = util.chalk,
	format = util.format;

var data = {};

function write(path, str) {
	fs.writeFile(path, str);
	console.log(chalk.cyan('   create:'), path);
}

function readTemplate(path) {
	var template = fs.readFileSync(__dirname + '/templates/components/' + path, 'utf8');
	for (var index in data) {
		template = template.split('__' + index + '__').join(data[index]);
	}
	return template;
}

function mkdir(path, fn) {
	shell.mkdir('-p', path);
	shell.chmod(755, path);
	console.log(chalk.cyan('   create:'), path);
	if (fn) fn();
}

function buildDirectoryStructure() {
	var name = data.name;

	var path = './components/' + data.pkgName;

	console.log('Files saved in components/' + data.pkgName);

	mkdir(path, function () {
		write(path + '/.gitignore', readTemplate('.gitignore'));
		write(path + '/package.json', readTemplate('package.json'));
		write(path + '/Gruntfile.js', readTemplate('Gruntfile.js'));
		write(path + '/component.js', readTemplate('component.js'));
		write(path + '/.jshintrc', readTemplate('.jshintrc'));
		write(path + '/wercker.yml', readTemplate('wercker.yml'));
		write(path + '/readme.md', readTemplate('readme.md'));
	});

	mkdir(path + '/config', function () {
		write(path + '/config/' + name + '.config.js', readTemplate('/config/config.js'));
	});

	mkdir(path + '/lib', function () {
		write(path + '/lib/' + name + '.lib.js', readTemplate('/lib/lib.js'));
	});

	mkdir(path + '/test', function () {
		write(path + '/test/' + name + '.test.js', readTemplate('/test/test.js'));
	});
}

exports.packages = function (name, options) {

	var pkg = require(process.cwd() + '/package.json');
	var camelName = format.camelCase(name);

	data = {
		pkgName: name.toLowerCase(),
		name: camelName,
		author: (typeof options.author === 'string' ? options.author : 'elefrant scaffold'),
		version: pkg.version
	};

	buildDirectoryStructure();
};
