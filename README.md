# express-hystrix-toobusy

The module provides express too-busy handler. The handler is based on [hystrix-too-busy module](https://github.com/trooba/hystrix-too-busy)

[![codecov](https://codecov.io/gh/dimichgh/express-hystrix-toobusy/branch/master/graph/badge.svg)](https://codecov.io/gh/dimichgh/express-hystrix-toobusy)
[![Build Status](https://travis-ci.org/dimichgh/express-hystrix-toobusy.svg?branch=master)](https://travis-ci.org/dimichgh/express-hystrix-toobusy) [![NPM](https://img.shields.io/npm/v/express-hystrix-toobusy.svg)](https://www.npmjs.com/package/express-hystrix-toobusy)
[![Downloads](https://img.shields.io/npm/dm/express-hystrix-toobusy.svg)](http://npm-stat.com/charts.html?package=express-hystrix-toobusy)
[![Known Vulnerabilities](https://snyk.io/test/github/dimichgh/express-hystrix-toobusy/badge.svg)](https://snyk.io/test/github/dimichgh/express-hystrix-toobusy)

### The idea

There are many module out there that try to implement detection of the system state and shed traffic automatically when it becomes too busy, mostly when CPU goes to 95% and everything gets slow.

The general logic is to measure difference between expected time and actual time when timer events is fired by event loop. That is called event loop latency and it depends on how busy the event loop is at any given point in time. This logic may misfire a lot due to unpredicted nature of runtime environment, memory profile and application logic.

To avoid the above problem we need an observation over some period of recent time, say 1 minute and based on statistic of too-busy error react accordingly. We might also want to react differently to different requests, give some higher priority than the other. Instead of implementing all this logic why not use [hystrixjs](https://www.npmjs.com/package/hystrixjs), which already provides these capabilities and does even more like runtime metrics?

### Install

```
$ npm install express-hystrix-toobusy -S
```

### Usage

```js
const toobusy = require('express-hystrix-toobusy');
const express = require('express');
const app = express();
app.use(toobusy({
    handler: (err, req, res) => {
        if (err.message === 'TooBusy') {
            res.status(503).end();
            return;
        }
        res.status(500).end();
    },
    commandResolver: req => {   // optional
        switch(req.path) {
            case '/':
                return 'home';
            case '/foo':
                return 'fooCommand';
            case '/bar':
                return 'fooCommand';
            default:
                return 'other';
        }
    }
    latencyThreshold: 70,
    interval: 500,
     // optional
    default: {
        circuitBreakerErrorThresholdPercentage: 50,
        circuitBreakerRequestVolumeThreshold: 20,
        circuitBreakerSleepWindowInMilliseconds: 5000
    },
    // optional
    commands: {
        fooCommand: {
            circuitBreakerErrorThresholdPercentage: 80
        },
        barCommand: {
            circuitBreakerRequestVolumeThreshold: 1
        }
    }
}));
```

### Configuration

The module exposes the configuration of [hystrix-too-busy](https://github.com/trooba/hystrix-too-busy) module.

By default, it assumes the same hystrix command for all requests with default hystrix configuration, but you can setup commandResolver that will start distinguishing requests between each other and tune too-busy settings for each command. If command config is not specified, it will use default one. This maybe useful if ones wants to give priorities to different routes. For example, if some commands are more important than the others, we can create 'important' command and tune the circuit breaker to stay longer close while unimportant ones will get short circuited and denied immediately when the system gets under the stress.
