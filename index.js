'use strict';

const Toobusy = require('hystrix-too-busy');

module.exports = function toobusyFactory(config) {
    if (config) {
        Toobusy.init(config);
        if (config.handler && typeof config.handler === 'string') {
            config.handler = require(config.handler);
        }
        if (config.commandResolver && typeof config.commandResolver === 'string') {
            config.commandResolver = require(config.commandResolver);
        }
    }

    return function toobusy(req, res, next) {
        const command = config && config.commandResolver && config.commandResolver(req);
        Toobusy.getStatus(command, busy => {
            if (busy) {
                const err = new Error('TooBusy');
                if (config && config.handler) {
                    return config.handler(err, req, res, next);
                }
                return next(err);
            }
            next();
        });
    };
};

module.exports.configure = Toobusy.init;
module.exports.Toobusy = Toobusy;
module.Hystrix = Toobusy.Hystrix;
