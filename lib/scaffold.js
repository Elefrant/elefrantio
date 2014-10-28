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

function readTemplate(type, path) {
	var template = fs.readFileSync(__dirname + '/templates/' + type + '/' + path, 'utf8');
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

function buildDirectoryStructurePackage() {
	var name = data.name,
			type = 'components';

	var path = './components/' + data.pkgName;

	console.log('Files saved in components/' + data.pkgName);

	mkdir(path, function () {
		write(path + '/.gitignore', readTemplate(type, '.gitignore'));
		write(path + '/package.json', readTemplate(type, 'package.json'));
		write(path + '/Gruntfile.js', readTemplate(type, 'Gruntfile.js'));
		write(path + '/component.js', readTemplate(type, 'component.js'));
		write(path + '/.jshintrc', readTemplate(type, '.jshintrc'));
		write(path + '/wercker.yml', readTemplate(type, 'wercker.yml'));
		write(path + '/readme.md', readTemplate(type, 'readme.md'));
	});

	mkdir(path + '/config', function () {
		write(path + '/config/' + name + '.config.js', readTemplate(type, '/config/config.js'));
	});

	mkdir(path + '/lib', function () {
		write(path + '/lib/' + name + '.lib.js', readTemplate(type, '/lib/lib.js'));
	});

	mkdir(path + '/test', function () {
		write(path + '/test/' + name + '.test.js', readTemplate(type, '/test/test.js'));
	});
}

function buildDirectoryStructureAction() {
	var name = data.name,
			type = 'actions';

	var path = './actions/' + data.pkgName;

	console.log('Files saved in actions/' + data.pkgName);

	mkdir(path, function () {
		write(path + '/action.js', readTemplate(type, 'action.js'));
	});

	mkdir(path + '/config', function () {
		write(path + '/config/' + name + '.js', readTemplate(type, '/config/config.js'));
	});

	mkdir(path + '/controllers', function () {
		mkdir(path + '/controllers/v1', function () {
			write(path + '/controllers/v1/' + name + '.js', readTemplate(type, '/controllers/v1/controller.js'));
		});
	});

	mkdir(path + '/models', function () {
		write(path + '/models/' + data.modelName + '.js', readTemplate(type, '/models/model.js'));
	});

	mkdir(path + '/routes', function () {
		write(path + '/routes/' + name + '.js', readTemplate(type, '/routes/route.js'));
	});

	mkdir(path + '/test', function () {
		write(path + '/test/' + name + '.js', readTemplate(type, '/test/test.js'));
	});
}

exports.packages = function (name, options) {

	var pkg = require(process.cwd() + '/package.json');
	var camelName = format.camelize(name);

	data = {
		pkgName: name.toLowerCase(),
		name: camelName,
		author: (typeof options.author === 'string' ? options.author : 'elefrant scaffold'),
		version: pkg.version
	};

	buildDirectoryStructurePackage();
};

exports.actions = function (name, options) {

	var pkg = require(process.cwd() + '/package.json'),
			camelName = format.camelize(name),
			name= name.toLowerCase();

	data = {
		pkgName: name,
		modelName: format.capitalize(name),
		name: camelName,
		author: (typeof options.author === 'string' ? options.author : 'elefrant scaffold'),
		version: pkg.version
	};

	buildDirectoryStructureAction();
};
