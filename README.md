# express-hystrix-toobusy

The module provides express too-busy handler. The handler is based on [hystrix-too-busy module](https://github.com/trooba/hystrix-too-busy)

[![codecov](https://codecov.io/gh/dimichgh/express-hystrix-toobusy/branch/master/graph/badge.svg)](https://codecov.io/gh/dimichgh/express-hystrix-toobusy)
[![Build Status](https://travis-ci.org/dimichgh/express-hystrix-toobusy.svg?branch=master)](https://travis-ci.org/dimichgh/express-hystrix-toobusy) [![NPM](https://img.shields.io/npm/v/express-hystrix-toobusy.svg)](https://www.npmjs.com/package/express-hystrix-toobusy)
[![Downloads](https://img.shields.io/npm/dm/express-hystrix-toobusy.svg)](http://npm-stat.com/charts.html?package=express-hystrix-toobusy)
[![Known Vulnerabilities](https://snyk.io/test/github/dimichgh/express-hystrix-toobusy/badge.svg)](https://snyk.io/test/github/dimichgh/express-hystrix-toobusy)

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
    latencyThreshold: 70,
    interval: 500,
    circuitBreakerErrorThresholdPercentage: 50,
    circuitBreakerRequestVolumeThreshold: 20,
    circuitBreakerSleepWindowInMilliseconds: 5000
}));
```

### Configuration

The module exposes the configuration of [hystrix-too-busy](https://github.com/trooba/hystrix-too-busy) module.
