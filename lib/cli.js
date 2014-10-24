'use strict';

var fs = require('fs'),
	path = require('path'),
	npm = require('npm'),
	shell = require('shelljs'),
	util = require('elefrant-util'),
	chalk = util.chalk,
	_ = util.lodash,
	request = require('request'),
	querystring = require('querystring'),
	cliVersion = require('../package').version,
	Prompt = require('prompt');

var pkgType = {
	contrib: 'Contrib',
	custom: 'Custom',
	core: 'Core'
};

var uri = 'http://localhost:2900/';

function Progress() {
	var interval, counter;

	function printMsg() {
		switch (counter) {
		case 0:
			console.log('Use `elefrant --help` from command line for all CLI options');
			break;
		case 1:
			console.log('Be sure to checkout all the docs on http://elefrant.com/#/docs');
			break;
		case 2:
			console.log('This may take a little while depending on your connection speed');
			break;
		case 15:
			console.log('Seems a bit slow. Check your internet connection...');
			break;
		default:
			console.log('Still cloning...');
			break;
		}
		counter++;
	}

	return {
		start: function () {
			counter = 0;
			interval = setInterval(printMsg, 3000);
		},
		stop: function () {
			clearInterval(interval);
		}
	};
}
var progress = new Progress();

// From express
function emptyDirectory(path, callback) {
	fs.readdir('./' + path, function (err, files) {
		if (err && 'ENOENT' !== err.code) throw new Error(err);
		callback(!files || !files.length);
	});
}

function ensureEmpty(path, force, callback) {
	emptyDirectory(path, function (empty) {
		if (empty || force) {
			callback();
		} else {
			console.log(chalk.yellow('Destination is not empty:'), path);
		}
	});
}

function getPackageInfo(data) {
	if (!data) return;
	var author = data.author ? chalk.gray('  Author: ') + (data.author.name ? data.author.name : data.author) : '';
	return chalk.green('   ' + data.name + '@' + data.version) + author;
}

function loadPackageJson(path, callback) {
	fs.readFile(path, function (err, data) {
		if (err) return callback(err);

		try {
			var pkg = JSON.parse(data.toString());
			pkg.elefrantVersion = pkg.elefrant || pkg.version;
			callback(null, pkg);
		} catch (err) {
			return callback(err);
		}
	});
}

function checkVersion() {
	console.log();
	console.log('    checking elefrantio and global versions');
	var elefrantioVersion, latest;
	loadPackageJson(process.cwd() + '/node_modules/elefrantio/package.json', function (err, data) {
		if (err) return console.log(chalk.yellow('Invalid ELEFRANT app or not in app root'));
		elefrantioVersion = data.version;
	});

	npm.load({
		global: true,
		loglevel: 'warn'
	}, function (err, npm) {
		npm.commands.outdated('elefrantio', true, function (err, list) {
			if (err) {
				console.log(chalk.red('Error: npm outdated failed'));
				return console.error(err);
			}
			latest = list[0] ? list[0][3] : elefrantioVersion; // list[0][3] holds the 'latest' value
			if (latest < elefrantioVersion) {
				console.log(chalk.yellow('    elefrantio is out of date'));
				console.log('    Current: ' + elefrantioVersion + ' Latest: ' + latest);
			} else {
				console.log(chalk.green('    elefrantio at latest version:'), elefrantioVersion);
			}
		});
	});

	npm.load({
		global: true,
		loglevel: 'warn'
	}, function (err, npm) {
		npm.commands.outdated('elefrantio', true, function (err, list) {
			if (err) {
				console.log(chalk.red('Error: npm outdated failed'));
				return console.error(err);
			}
			latest = list[0] ? list[0][3] : cliVersion; // list[0][3] holds the 'latest' value
			if (latest < cliVersion) {
				console.log(chalk.yellow('    elefrantio is out of date'));
				console.log('    Current: ' + cliVersion + ' Latest: ' + latest);
			} else {
				console.log(chalk.green('    elefrantio at latest version:'), cliVersion);
			}
		});
	});
}

function requiresRoot(callback) {
	loadPackageJson(process.cwd() + '/package.json', function (err, data) {
		if (err || !_.has(data.engines, 'elefrant')) {
			console.log(chalk.yellow('Invalid ELEFRANT app or not in app root. Check engines from package.json'));
		} else {
			callback();
		}
	});
}


/* START OF NETWORK FUNCTIONS */
function getUserHome() {
	return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

function readToken() {
	var file = (process.platform === 'win32') ? '_elefrant' : '.elefrant';
	var path = getUserHome() + '/' + file;

	if (!shell.test('-e', path)) return null;

	return shell.cat(path);
}

var whoami = exports.whoami = function (callback) {

	var token = readToken();

	if (token) {

		var options = {
			uri: uri + 'api/elefrantio/whoami',
			method: 'GET',
			headers: {
				'authorization': token
			}
		};

		request(options, function (error, response, body) {
			if (!error && (response.statusCode === 200 || response.statusCode === 201)) {

				if (callback) return callback(body);
				console.log(body);

			} else {
				console.log('Client is NOT Authorized. Invalid token.');
			}
		});

	} else {
		console.log('Client is NOT Authorized.');
	}
};

var authorize = exports.authorize = function (token, callback) {

	var file = (process.platform === 'win32') ? '_elefrant' : '.elefrant';
	var path = getUserHome() + '/' + file;

	if (token) {
		fs.writeFile(path, token, function (err) {
			if (err) console.log(err);

			whoami();
		});
	} else {

		Prompt.start();

		Prompt.get({
				properties: {
					token: {
						hidden: true,
						required: true
					}
				}
			},

			function (err, result) {

				fs.writeFile(path, result.token, function (err) {
					if (err) console.log(err);

					whoami(callback);
				});

			});

	}
};

exports.logout = function () {
	var file = (process.platform === 'win32') ? '_elefrant' : '.elefrant';
	var path = getUserHome() + '/' + file;
	shell.rm(path);
};

exports.register = function () {

	Prompt.start();

	Prompt.get({
			properties: {
				name: {
					pattern: /^[a-zA-Z\s\-]+$/,
					minLength: 4,
					maxLength: 15,
					message: 'Name must be only letters, spaces, or dashes (min length of 4)',
					required: true
				},
				username: {
					minLength: 4,
					maxLength: 10,
					pattern: /^[a-zA-Z\s\-]+$/,
					message: 'Username must be only letters, spaces, or dashes (min length of 4)',
					required: true
				},
				email: {
					format: 'email',
					required: true
				},
				password: {
					minLength: 8,
					maxLength: 15,
					pattern: /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/,
					message: 'Password must be only letters, spaces, or dashes 8-15 characters long',
					hidden: true,
					required: true
				}
			}
		},

		function (err, result) {

			if (err) throw err;

			var options = {
				uri: uri + 'api/elefrantio/user',
				method: 'POST',
				form: result,
				headers: {
					'Content-Type': 'multipart/form-data',
					'Content-Length': querystring.stringify(result).length
				}

			};

			request(options, function (err, response, body) {
				if (!err && (response.statusCode === 200 || response.statusCode === 201)) {
					console.log('Registration Successful! \n Authorizing the elefrant client.');

					body = JSON.parse(body);

					authorize(body.token, function () {
						console.log('Run `elefrant whoami` to see authorized credentials');
					});

				} else {
					console.log(chalk.red('Error: Registration Failed!'));
					if (err) {
						return console.error(err);
					}
				}
			});

		});

};

exports.addKey = function () {

	var home = getUserHome();

	var keys = shell.ls(home + '/.ssh');

	keys.forEach(function (key, index) {
		console.log('[' + (index + 1) + '] ' + key);
	});

	console.log('Select SSH key to associate to your account:');

	Prompt.start();

	Prompt.get({
			properties: {
				key: {
					format: 'number',
					required: true
				}
			}
		},

		function (err, result) {
			if (!keys[result.key - 1]) return console.log('Invalid selection');

			var sshKey = shell.cat(home + '/.ssh/' + keys[result.key - 1]);

			var token = readToken();

			if (token) {

				var keyData = {
					key: sshKey,
					title: keys[result.key - 1]
				};

				var options = {
					uri: uri + 'api/elefrantio/keys',
					method: 'POST',
					form: keyData,
					headers: {
						'Content-Type': 'multipart/form-data',
						'Content-Length': querystring.stringify(keyData).length,
						'authorization': token
					}
				};

				request(options, function (error, response, body) {
					if (!error && (response.statusCode === 200 || response.statusCode === 201)) {

						console.log(body);
					} else {
						console.log('Add Key Failed!');
					}
				});
			}
		});
};

exports.login = function () {

	Prompt.start();

	Prompt.get({
			properties: {
				email: {
					format: 'email',
					required: true
				},
				password: {
					minLength: 8,
					maxLength: 15,
					pattern: /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/,
					message: 'Password must be only letters, spaces, or dashes 8-15 characters long',
					hidden: true,
					required: true
				}
			}
		},

		function (err, result) {

			if (err) throw err;

			var options = {
				uri: uri + 'api/elefrantio/user/login',
				method: 'POST',
				form: result,
				headers: {
					'Content-Type': 'multipart/form-data',
					'Content-Length': querystring.stringify(result).length
				}

			};

			request(options, function (err, response, body) {
				if (!err && (response.statusCode === 200 || response.statusCode === 201)) {
					console.log('Login Successful! \n Authorizing the elefrant client.');

					body = JSON.parse(body);

					authorize(body.token.api, function () {
						console.log('Run `elefrant whoami` to see authorized credentials');
					});

				} else {
					console.log(chalk.red('Error: Login Failed!'));
					if (err) {
						return console.error(err);
					}
				}
			});

		});

};

function checKeys(callback) {

	var token = readToken();
	if (!token) return console.log('Client not authorized! Use `elefrant authorize` or `elefrant register` to create a user.');

	var options = {
		uri: uri + 'api/elefrantio/keys',
		method: 'GET',
		headers: {
			'authorization': token
		}
	};

	request(options, function (error, response, body) {
		if (!error && response.statusCode === 200 && response.body.length) {
			callback(JSON.parse(body));
		} else {
			callback([]);
		}
	});
}

function publishPackage(data, callback) {

	var body = {
		name: data.name,
		description: data.description,
		version: data.version,
		keywords: data.keywords
	};

	var token = readToken();

	var options = {
		uri: uri + 'api/elefrantio/packages/publish',
		method: 'POST',
		form: querystring.stringify(body),
		headers: {
			'Content-Type': 'multipart/form-data',
			'Content-Length': querystring.stringify(body).length,
			'authorization': token
		}

	};

	request(options, function (error, response, body) {
		if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
			callback(JSON.parse(body));
		} else {
			console.log('Failed to publish: ');
			console.log(error);
		}
	});
}

exports.publish = function () {

	loadPackageJson('./package.json', function (err, pck) {
		if (err || !pck) return console.log('You must be in a package root');

		checKeys(function (keys) {
			if (!keys.length) return console.log('You do not have any SSH keys. User `elefrant addKey`');

			if (!shell.which('git')) return console.log(chalk.red('    Prerequisite not installed: git'));

			console.log(chalk.green('    You are about to publish your package.'));
			console.log(chalk.green('    In doing so your package, once moderated and approved'));
			console.log(chalk.green('    will be available for all to use on the elefrant network.'));
			console.log(chalk.green('    An email with instructions will be sent to you once approved'));
			console.log(chalk.green('    (A package only needs approval on first publication)'));
			console.log();
			console.log(chalk.green('    I agree y/Y'));
			console.log(chalk.green('    No. Anything else'));
			Prompt.start();

			Prompt.get({
					properties: {
						agree: {
							pattern: /^[a-zA-Z\s\-]+$/,
							minLength: 1,
							maxLength: 5,
							message: 'Do you agree to publish your package? y/Y for YES, Anything else NO',
							required: true
						}
					}
				},

				function (err, result) {

					if (err) throw err;
					if (result.agree.toLowerCase() !== 'y') return console.log(chalk.red('Package publish aborted by user...'));

					publishPackage(pck, function (data) {

						if (!shell.test('-d', '.git')) {

							shell.exec('git init', function (code) {
								if (code) return console.log(chalk.red('Error: git init failed'));

							});
						}

						if (!shell.test('-e', '.gitignore')) {
							fs.writeFileSync('.gitignore', 'node_modules');
						}

						var silentState = shell.config.silent; // save old silent state
						shell.config.silent = true;

						shell.exec('git remote add elefrantio ' + data.repo, function (code) {
							if (!code) {
								console.log(chalk.yellow('Remote added'));
								console.log(chalk.green('Package Created: ' + data.name));
								console.log(chalk.green('You can now push your code to update latest/master '));
								console.log(chalk.green('    `git push elefrantio master`'));
								console.log(chalk.green('Running the publish command again will make a tag of the version pushed '));
								console.log(chalk.green('    `elefrant publish`'));
							}
						});

						shell.exec('git log -n 1', function (code) {

							if (!code) {
								shell.exec('git tag -f ' + data.version.toString(), function (code) {
									shell.config.silent = silentState;

									if (!code) {
										shell.exec('git push elefrantio --force ' + data.version.toString(), function (code) {

											if (!code) {
												console.log(chalk.green('Publish Success! ' + data.name + '@' + data.version));
												console.log('Use the `git add ` and `git commit ` then git push elefrantio master` to push your code');
												console.log('Use `elefrant publish` to create tags based on your current version in package.json');
											}
										});
									}
								});

							}
						});

					});
				});
		});
	});
};

exports.search = function (keywords) {

	var options = {
		uri: uri + 'api/elefrantio/packages/search?q=' + keywords,
		method: 'GET'
	};

	request(options, function (error, response, body) {

		if (!error && (response.statusCode === 200 || response.statusCode === 201)) {

			var results = JSON.parse(body);
			console.log(chalk.green(results.length + ' found.'));
			results.forEach(function (pkg) {
				var authors = [];
				pkg.authors.forEach(function (author) {
					authors.push(author.username);
				});
				console.log(chalk.green(pkg.name) + '@' + pkg.version + ' ' + pkg.description + chalk.green(' by: ') + authors.join(','));
			});
		} else {

			console.log(error);
		}
	});
};
/* END OF NETWORK FUNCTIONS */

exports.init = function (name, options) {
	if (!shell.which('git')) return console.log(chalk.red('    Prerequisite not installed: git'));

	var source = (options.git ? 'git@github.com:Elefrant/elefrant.git' : 'https://github.com/Elefrant/elefrant.git');

	// Allow specifying specific repo
	if (options.repo) {
		source = options.repo;
	}

	console.log(chalk.green('Cloning branch: %s into destination folder:'), options.branch, name);

	progress.start();
	source = options.branch + ' ' + source + ' ' + name;
	shell.exec('git clone -b ' + source, function (code, output) {
		progress.stop();
		if (code) return console.log(chalk.red('Error: git clone failed:', output));

		loadPackageJson('./' + name + '/package.json', function (err, data) {
			if (err) {
				console.log(chalk.yellow('Something went wrong. Try again or use --git flag'));
				console.log(chalk.yellow('If the problem persists see past issues here: https://github.com/Elefrant/elefrant/issues'));
				console.log(chalk.yellow('Or open a new issue here https://github.com/Elefrant/elefrant/issues/new'));
				//fallback code here
				process.exit();
			}

			console.log(chalk.green('Version: %s cloned'), data.elefrantVersion);
			console.log();

			fs.readFile(__dirname + '/templates/logo.txt', function (err, data) {
				console.log(data.toString());
				console.log();

				shell.cd(name);
				shell.exec('git remote rename origin upstream', function (code) {
					if (!code) {
						console.log('   git remote upstream set');
						console.log();
					}
				});

				var grunted = shell.which('grunt');

				if (options.quick) {
					npm.load(function (err, npm) {
						console.log(chalk.green('   installing dependencies...'));
						console.log();
						npm.commands.install(function (err) {
							if (err) {
								console.log(chalk.red('Error: npm install failed'));
								return console.error(err);
							}
							console.log(chalk.green('   running the elefrant app...'));
							console.log();
							if (grunted) {
								shell.exec('grunt', ['-f']);
							} else {
								shell.exec('node server');
							}
						});
					});
				} else {
					console.log('   install dependencies:');
					console.log(chalk.magenta('     $ cd %s && npm install'), name);
					console.log();
					console.log('   run the server:');
					console.log(chalk.magenta('     $', grunted ? 'grunt' : 'node server'));
					console.log();
				}
				console.log('   Extra Docs at http://elefrant.com/#/docs');
				console.log();
			});
		});
	});
};

function getPackage(name, callback) {

	var options = {
		uri: uri + 'api/components/' + name,
		method: 'GET'
	};

	request(options, function (error, response, body) {
		if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
			if (callback) return callback(JSON.parse(body));
		} else {
			console.log(chalk.yellow('   Package not found.'));
		}
	});
}

function codepackagesElefrantJson(code) {
	if (code) console.log(code);
}

function packagesElefrantJson(source) {
	// Load elefrant.json
	loadPackageJson(path.join(source, 'elefrant.json'), function (err, data) {
		if (err || !data) return;

		for (var dep in data.dependencies) {
			shell.cd(process.cwd());
			shell.exec('node node_modules/elefrantio/bin/elefrant-install ' + dep + '@' + data.dependencies[dep], codepackagesElefrantJson);
		}
	});

}

exports.install = function (module, options) {
	requiresRoot(function () {

		loadPackageJson('./node_modules/elefrantio/package.json', function (err, data) {

			var destination = 'components/';

			module = module.split('@');

			var packageName = module[0];
			var tag = 'master';

			tag = tag === 'latest' ? 'master' : tag;

			getPackage(packageName, function (data) {
				console.log(chalk.green('    Installing component: %s:'), module[0]);

				var cloneUrl = options.git ? data.repo : 'https://git.elefrant.io/' + data.repo.split(':')[1];

				console.log(cloneUrl);

				// shell.rm('-rf', destination + data.name);
				//
				// console.log('git clone --branch ' + tag + ' ' + cloneUrl + ' ' + destination + data.name);
				//
				// var silentState = shell.config.silent; // save old silent state
				// shell.config.silent = true;
				//
				// shell.exec('git clone --branch ' + tag + ' ' + cloneUrl + ' ' + destination + data.name, function (code) {
				//
				// 	shell.config.silent = silentState;
				//
				// 	if (code) return console.log('Failed to clone repo');
				//
				//
				// 	var pkgPath = destination + data.name;
				//
				// 	shell.rm('-rf', destination + data.name + '/.git');
				// 	shell.rm('-rf', destination + data.name + '/.gitignore');
				//
				// 	// Load elefrant.json
				// 	packagesElefrantJson(__dirname);
				//
				// 	if (options.skipNpm) return;
				//
				// 	// Load package.json
				// 	loadPackageJson(pkgPath + '/package.json', function (err, data) {
				// 		if (err) return console.error(err);
				//
				// 		console.log();
				// 		if (!data.elefrant) {
				// 			console.log();
				// 			console.log(chalk.yellow('Warning: The module installed is not a valid ELEFRANT module'));
				// 		}
				//
				// 		shell.cd(pkgPath);
				//
				// 		shell.exec('npm install .', function (code) {
				//
				// 			if (code) return console.log(code);
				//
				// 			console.log(chalk.green('    Dependencies installed for package ' + data.name));
				//
				// 			require('bower').commands.install().on('error', function (err) {
				// 				console.log(chalk.yellow('    ' + err + ' ' + data.name));
				// 			});
				//
				// 		});
				// 	});
				// });
			});
		});
	});
};

function packagesNpmInstall(source) {
	var packages = path.join(process.cwd(), source);
	npm.load({
		loglevel: 'error'
	}, function (err, npm) {
		fs.readdir(packages, function (err, files) {
			if (err && 'ENOENT' !== err.code) throw Error(err);

			if (!files || !files.length) return;
			console.log(chalk.green('Auto installing package dependencies'));

			files.forEach(function (file) {
				var pkgPath = path.join(packages, file);

				packagesElefrantJson(pkgPath);

				loadPackageJson(path.join(pkgPath, 'package.json'), function (err, data) {
					if (err || !data.elefrant) return;

					npm.commands.install(pkgPath, [pkgPath], function (err) {
						if (err) {
							console.log(chalk.red('Error: npm install failed'));
							return console.error(err);
						} else {
							console.log(chalk.green('    Dependencies installed for package ' + file));
						}
					});
				});
			});
		});
	});
}

exports.postinstall = function () {
	requiresRoot(function () {
		packagesNpmInstall('components');

		// Load elefrant.json

		var source = process.cwd();
		packagesElefrantJson(source);

	});
};

exports.uninstall = function (module) {
	requiresRoot(function () {
		console.log(chalk.yellow('Removing component:'), module);

		if (shell.test('-d', './components/' + module)) {
			shell.rm('-rf', './components/' + module);
		}

		console.log(chalk.green('   uninstall complete'));
	});
};

exports.list = function () {
	requiresRoot(function () {

		console.log(chalk.cyan('   ELEFRANT Components List:'));
		console.log('   -----------------');

		var path = './components/';

		fs.readdir(path, function (err, files) {
			if (err || !files.length) return console.log(chalk.yellow('   No components'));
			files.forEach(function (file) {
				loadPackageJson(path + file + '/package.json', function (err, data) {
					if (!err && data) {
						if (_.has(data.engines, 'elefrant')) {
							console.log(getPackageInfo(data))
						}
					}
				});
			});
		});
	});
};

exports.status = function (options) {
	requiresRoot(function () {
		console.log();
		console.log(chalk.green('    ELEFRANT Status'));
		console.log('    -----------');
		console.log();
		loadPackageJson('./package.json', function (err, data) {
			if (err) throw new Error(err);
			console.log('    ELEFRANT VERSION: ' + chalk.cyan(data.elefrantVersion));
			checkVersion();
		});
	});
};

exports.pkg = function (name, options) {
	requiresRoot(function () {
		if (options.delete) {
			console.log(chalk.yellow('Removing package:'), name);
			shell.rm('-rf', './components/' + name);
		} else {
			ensureEmpty('./components/' + name, options.force, function () {
				require('./scaffold.js').packages(name, options);
			});
		}
	});
};

exports.printUser = function (email, options) {
	requiresRoot(function () {
		mongoConnect(options.env, function (err, db) {
			if (err) throw new Error(err);
			db.collection('users').find({
				email: email
			}).toArray(function (err, user) {
				console.dir(user);
				db.close();
			});
		});
	});
};

exports.updateRole = function (email, options, type) {
	requiresRoot(function () {
		var update = {};
		switch (type) {
		case 'a':
			console.log('  Adding role `' + options.addRole + '` to user `' + email + '`');
			update.$push = {
				roles: options.addRole
			};
			break;
		case 'r':
			console.log('  Removing role `' + options.removeRole + '` from user `' + email + '`');
			update.$pull = {
				roles: options.removeRole
			};
			break;
		default:
			return;
		}
		mongoConnect(options.env, function (err, db) {
			if (err) throw new Error(err);
			db.collection('users').update({
				email: email
			}, update, {
				w: 1,
				upsert: false,
				multi: false
			}, function (err) {
				if (err) console.error(err);
				else console.log(chalk.green('successfully updated'));
				db.close();
			});
		});
	});
};
