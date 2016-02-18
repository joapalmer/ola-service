'use strict'

// Don't want to have a lot of relative requires
global.__base = __dirname + '/app/';

var config = require(__base + 'config'),
    params = require('commander'),
    simpleLogger = require('simple-node-logger'),
    express = require('express'),
    app = express(),
    DMX = require(__base + 'routes/dmx'),
    localStatus = require(__base + 'services/localStatus'),
    login = require(__base + 'model/login');

params
  .version('0.0.1')
  .option('-b, --boot', 'For running on system boot')
  .option('-l, --log-level <n>', 'Log Level', /^(info|warn|error|all)$/i, 'warn')
  .option('-o, --output-to-console', 'Output log to console instead of file')
  .option('-s, --status', 'Status of the system')
  .parse(process.argv);

var runDiagnostic = params.status || false;

var log = params.outputToConsole || runDiagnostic ? simpleLogger.createSimpleLogger() : simpleLogger.createRollingFileLogger( config.logProperty );

log.setLevel(params.logLevel);

if (runDiagnostic) {
    dataStorage.connect().then(() => {
        log.info('Data storage is online');
    }, () => {
        log.error('Data storage is offline');
    });
}

var isBoot = params.boot || false,
    port = process.env.PORT || config.app.port;

log.info('Started');

// Start check on local status
localStatus.startChecker();

app.use(login.middleware);

app.post('*', (req, res, next) => {
    if (!login.isVerified(req)) {
        res.status(403)
            .json({status: -1, message: 'Your not allowed to post to this API'});
        return;
    }
    next();
});

app.use('/api/dmx', DMX);

app.listen(port);

// logger.info('Running worker service on port %d', port);

