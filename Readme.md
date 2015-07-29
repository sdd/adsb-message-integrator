# adsb-message-integrator

A Microservice that processes ADSB messages in order to track and predict the current state of all transponders.

## Example usage

The module uses Seneca as it's microservices framework and is bundled 
with Koa bindings so that you can get up and running with it quickly.
Here is an minimal example of using Koa to create a server that 
processes ADSB messages POSTed via /message, and serves up state
via GET requests to /state:

```javascript
var app    = require('koa')();
app.use(require('koa-bodyparser')());

var seneca = require('seneca')();
seneca.use('seneca-bluebird');

var integrator = require('adsb-message-integrator')({}, seneca);
app.use(integrator.koa());

app.listen(8888);
```

There is an example application bundled in as example.js which can be
run to see a working example:

```bash
node --harmony_arrow_functions example.js
```

## Todo

* MLAT
