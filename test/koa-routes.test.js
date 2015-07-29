"use strict";
var request         = require('supertest'),
    koa             = require('koa'),
    mount           = require('koa-mount'),
    router          = require('koa-router'),
    Promise         = require('bluebird'),
    chai            = require("chai"),
    sinon           = require("sinon"),
    expect          = chai.expect;

chai.use(require("sinon-chai"));

var senecaAuthKoa = require('../koa-routes');

describe('koa-routes', function() {

    var ctx = {
        state: {
            jwt: { sub: 'USERID1' }
        },
        session: {}
    };

    var senecaActStub = sinon.stub();
    var senecaMock = { actAsync: senecaActStub };

    var app = koa()
        .use(require('koa-bodyparser')())
        .use(senecaAuthKoa(senecaMock));

    senecaActStub.returns(Promise.resolve({ result: 'RESULT1' }));

    var testRouter = router()
        .all('*', function * (next) {
            this.session = ctx.session;
            this.state = ctx.state;
            yield next;
        });

    var superApp = koa()
        .use(testRouter.routes())
        .use(mount('/', app));
    superApp.keys = ['test'];

    describe('POST /message', function() {

        it('should pass the correct system and action to seneca', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .post('/message')
	            .send({ name: 'MESSAGE1' })
                .end(function() {

                    expect(senecaActStub.args[0][0].system).to.equal('ADSB');
                    expect(senecaActStub.args[0][0].action).to.equal('submitMessage');

                    done();
                });
        });

        it('should pass the message', function(done) {

	        senecaActStub.reset();
	        request(superApp.listen())
		        .post('/message')
		        // userid passed in as sub from jwt in state
		        .send({ name: 'MESSAGE1' })
		        .end(function() {

			        expect(senecaActStub.args[0][0].message.name).to.equal('MESSAGE1');

			        done();
		        });
        });

        it('should return the response from seneca as the body', function(done) {
            senecaActStub.reset();
            request(superApp.listen())
	            .post('/message')
	            .send({ name: 'MESSAGE1' })
	            .expect(200)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.result).to.equal('RESULT1');
                })
                .end(done);
        })
    });

    describe('GET /state', function() {

        it('should pass the correct system and action to seneca', function(done) {

            senecaActStub.reset();
            request(superApp.listen())
                .get('/state')
                .expect(function() {
                    expect(senecaActStub.args[0][0].system).to.equal('ADSB');
                    expect(senecaActStub.args[0][0].action).to.equal('getState');
                })
                .end(done);
        });

        it('should return the response from seneca as the body', function(done) {
            senecaActStub.reset();
            request(superApp.listen())
	            .get('/state')
	            .expect(200)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.result).to.equal('RESULT1');
                })
                .end(done);
        })
    });
});
