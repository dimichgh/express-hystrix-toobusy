'use strict';

const Assert = require('assert');
const Async = require('async');
const Toobusy = require('hystrix-too-busy');
const express = require('express');
const supertest = require('supertest');
const handler = require('..');

describe(__filename, () => {
    it('should pass', next => {
        const app = express();
        app.use(handler());
        app.use((req, res) => {
            res.send('ok');
        });

        supertest(app).get('/').end((err, res) => {
            Assert.ok(!err, err && err.stack);
            Assert.equal('ok', res.text);
            next();
        });
    });

    it('should throw busy error', next => {
        handler.configure({
            circuitBreakerRequestVolumeThreshold: 1
        });

        Toobusy.deps.toobusy = () => true;

        const app = express();
        app.use(handler());
        app.use((req, res) => {
            res.send('ok');
        });
        app.use((err, req, res) => {
            Assert.ok(err);
            Assert.equal('TooBusy', err.message);
            res.status(500).end();
        });

        Async.series([
            next => {
                supertest(app).get('/').end((err, res) => {
                    Assert.ok(!err, err && err.stack);
                    Assert.equal('ok', res.text);
                    next();
                });
            },

            next => {
                supertest(app).get('/')
                .expect(500).end((err, res) => {
                    Assert.ok(!err, err && err.stack);
                    next();
                });
            }
        ], next);
    });

    it('should use custom error handler', next => {
        handler.configure({
            circuitBreakerRequestVolumeThreshold: 1
        });

        Toobusy.deps.toobusy = () => true;

        const app = express();
        app.use(handler({
            handler: (err, req, res) => {
                Assert.ok(err);
                Assert.equal('TooBusy', err.message);
                res.status(500).end();
            }
        }));
        app.use((req, res) => {
            res.send('ok');
        });

        Async.series([
            next => {
                supertest(app).get('/').end((err, res) => {
                    Assert.ok(!err, err && err.stack);
                    Assert.equal('ok', res.text);
                    next();
                });
            },

            next => {
                supertest(app).get('/')
                .expect(500).end((err, res) => {
                    Assert.ok(!err, err && err.stack);
                    next();
                });
            }
        ], next);
    });
});
