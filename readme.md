# [![ELEFRANT Logo](https://raw.githubusercontent.com/Elefrant/elefrantio/ee8f771ab7be672b6f44d3d531059d1630bfd79a/lib/templates/logo.png)](http://elefrant.com/) ELEFRANT Core & Cli

[![wercker status](https://app.wercker.com/status/63ea08a96edc6f4a6897affb592ceeff/s/master "wercker status")](https://app.wercker.com/project/bykey/63ea08a96edc6f4a6897affb592ceeff) [![Dependency Status](https://gemnasium.com/Elefrant/elefrantio.svg)](https://gemnasium.com/Elefrant/elefrantio) [![npm version](https://badge.fury.io/js/elefrantio.svg)](http://badge.fury.io/js/elefrantio)


Source for npm package elefrantio.
Is used primarily to manage components for extending functionality.
The cli provides a lot of useful functionality, such as scaffolding options to create new components, add/remove and list currently installed components.
See http://elefrant.com/#/docs for more in-depth information about Elefrant.


## Content

* The bin file used for cli operations.
* Core functionality for managing components and actions.


## Install

```sh
$ npm install -g elefrantio
```


## Usage

Usage of the command line:

```
Usage: elefrant [options] [command]

  Commands:

    init <name> [options]             Create a ELEFRANT api server in the current working directory
    postinstall                       Run npm install for components
    install <component> [options]     Installs a ELEFRANT component
    uninstall <component>             Uninstalls a ELEFRANT component
    docs                              Open ELEFRANT documentation in your local browser
    component <name> [options]        Create a component
    action <name> [options]           Create a action
    list                              List all installed components
    status                            Overall system status
    user <email> [options]            Manage users
    authorize                         Authorize your client
    logout                            Logout authorized client
    login                             Login to the network and authorized client
    whoami                            Identifies authorized user
    register                          Registers a user on elefrant network
    addKey                            Add SSH key to elefrant.com
    publish                           Publishes a component on the elefrant network
    search <component>                Searches for a component on the elefrant network
    help [cmd]                        Display help for [cmd]

Options:

    -h, --help     output usage information
    -v, --version  output the version number
```


## License

MIT © [Elefrant](http://elefrant.com/#/license)
