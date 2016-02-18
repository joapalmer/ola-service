'use strict'

var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    OLA = require(__base + 'services/ola'),
    config = require(__base + 'config'),
    localStatus = require(__base + 'services/localStatus'),
    login = require(__base + 'model/login');

router.get('/', (req, res, next) => {
    OLA.getStatus()
        .then((status) => {
            res.json({
                status: 1,
                info: status,
                msToNextTimelineCheck: localStatus.timeToNextCheck(),
                lastRunning: localStatus.lastRunning(),
                login: login.isVerified(req)
            });
            next();
        })
        .catch((error) => {
            res.status(500)
                .json({
                    status: -1,
                    error: error
                    });
            next();
        });
});

router.post('/resume', (req, res, next) => {
    // Command for resuming previously running timeline
    var result = OLA.resetToLastTimeline();
    // Check if result is promise or false. Return better message depending of outcome.
    res.json({status: 1, message: 'OK. Resuming.'});
    next();
});

var jsonParser = bodyParser.json();

router.post('/set', jsonParser, (req, res, next) => {
    var validation = true;

    if (typeof req.body.universe == 'undefined' ||
        isNaN(req.body.universe)) {
        validation = false;
    }
    console.log('type',req.body.dmx)
    if (typeof req.body.dmx == 'undefined' ||
        !Array.isArray(req.body.dmx) ||
        req.body.dmx.every(val => isNaN(val))) {
        validation = false;
    }

    if (!validation) {
        res.status(400)
            .json({ status: -1, message: 'Parameters does not validate.' });
        next();
        return;
    }

    var universe = req.body.universe,
        dmx = req.body.dmx;

    OLA.setDMX(universe, dmx, config.ola.manualSettingTimeout)
        .then(() => {
            res.json({status: 1, message: 'OK. Setting static color.'});
            next();
        })
        .catch((error) => {
            res.status(500)
                .json({ status: -1, message: error });
            next();
        });
});

module.exports = router;