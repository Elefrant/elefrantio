'use strict';

/*{
    name: 'nameforroute', (optional)
    path: 'url/of/the/route',
    method: 'GET or POST or PUT or DELETE or PATCH or HEAD or OPTIONS', (optional, default GET method)
    version: [ (optional, default current version)
        '1.0.0',
        '2.0.1'
    ],
    ...componentsAction: values...., // Components options
    action: 'controller.version.method'
},*/

// Create routes
module.exports = [{
	path: '/__pkgName__',
	method: 'GET',
	version: [
		'1.0.0'
	],
	action: '__pkgName__.v1.status'
}];
