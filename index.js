'use strict';

const Toobusy = require('hystrix-too-busy');

module.exports = function toobusyFactory(config) {
    let fallback;
    let commandResolver;
    if (config) {
        Toobusy.init(config);
        fallback = config.fallback;
        if (fallback && typeof fallback === 'string') {
            fallback = require(fallback);
        }
        commandResolver = config.commandResolver;
        if (commandResolver && typeof commandResolver === 'string') {
            commandResolver = require(commandResolver);
        }
    }

    return function toobusy(req, res, next) {
        const command = commandResolver && commandResolver(req);
        Toobusy.getStatus(command, busy => {
            if (busy) {
                const err = new Error('TooBusy');
                if (fallback) {
                    return fallback(err, req, res, next);
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
