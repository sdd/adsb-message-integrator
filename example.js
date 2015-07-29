var app    = require('koa')();
app.use(require('koa-bodyparser')());

var seneca = require('seneca')();
seneca.use('seneca-bluebird');

var integrator = require('./index')({}, seneca);
app.use(integrator.koa());

app.listen(8888);
