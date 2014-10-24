# Elefrant ORM

[![wercker status](https://app.wercker.com/status/ed958a0d0e57a3d11084695e9728b6b1/s/master "wercker status")](https://app.wercker.com/project/bykey/ed958a0d0e57a3d11084695e9728b6b1)

[![Dependency Status](https://gemnasium.com/Elefrant/elefrant-orm.svg)](https://gemnasium.com/Elefrant/elefrant-orm)

## Install

```sh
$ npm install --save elefrant-orm
```


## Usage

Elefrant orm connect [Waterline ORM](https://github.com/balderdashy/waterline) with Elefrant Framework

```js
var orm = require('elefrant-orm');

var options = {
adapters: {/* .. Adapter .. */},
connections: {/* .. Connections .. */},
collections: {/* .. Collections .. */},
};

orm(options, function (err, models) {
    if (err) {
        console.log(err);
    } else {
        // Get models
        // models.connections & models.collections
        console.log(models);
    }
});
```

## License

MIT © [Elefrant](http://elefrant.com/#/license)
