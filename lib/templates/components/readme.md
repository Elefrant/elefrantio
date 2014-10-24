# __pkgName__ Component


## Usage

Some description of __pkgName__.


## Structure

### Component `/component.js`

Main file of the component. Register the functionality for the different parts of the server.

```js
module.exports = {
    // True if enabled component
    enable: true,

    // Name of component
    name: '__name__',

    // Actions to do before Server creation
    beforeServer: function (elefrant) {
        // Actions and functions
    },

    // Actions to do after Server creation
    afterServer: function (elefrant, server) {
        // Actions and functions
    },

    // Variables to add when the server is creating
    paramServer: function (elefrant) {
        // Actions and functions
    },

    // Actions to do before create routes
    beforeRoute: function (elefrant) {
        // Actions and functions
    },

    // Actions to do after create routes
    afterRoute: function (elefrant) {
        // Actions and functions
    },

    // Variables to add when is creating each route
    paramRoute: function (route) {
        // Actions and functions
    },

    // Function to register to use in controllers or actions
    register: function (elefrant) {
        // Actions and functions
    }
};
```


### Config `/config/`

Default config files for __pkgName__ component.

**To allow users customize the config files, you should allow to create a file in general config folder. Will be easy to change. For example: `elefrant/config/__name__.js`**


### Lib `/lib/`

Create all the needed libraries.


### Test `/test/`

Create test files


## Launch tests

Just put in the console: `npm test`


## License

MIT © [Elefrant](http://elefrant.com/#/license)
