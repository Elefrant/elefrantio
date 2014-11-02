# [![ELEFRANT Logo](https://raw.githubusercontent.com/Elefrant/elefrantio/ee8f771ab7be672b6f44d3d531059d1630bfd79a/lib/templates/logo.png)](http://elefrant.com/) ELEFRANT Core & Cli

[![wercker status](https://app.wercker.com/status/ed958a0d0e57a3d11084695e9728b6b1/s/master "wercker status")](https://app.wercker.com/project/bykey/ed958a0d0e57a3d11084695e9728b6b1)

[![Dependency Status](https://gemnasium.com/Elefrant/elefrantio.svg)](https://gemnasium.com/Elefrant/elefrantio)


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
    preinstall                        Install dependencies from elefrant.json
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
