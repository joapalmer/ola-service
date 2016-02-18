var request = require('request-promise'),
    config = require(__base + 'config'),
    OLA = require(__base + 'services/ola');

var localStatus = {},
    timeoutRef = null,
    lastData = null,
    lastRunning = null, lastRunninStatus = false;

localStatus.getLocalStatus = () => {
    return new Promise((resolve, reject) => {
        var uri = config.localStatus.addr + ':' + config.localStatus.port + config.localStatus.extension;

        var lookup = () => {
            request({
                    'method': 'GET',
                    'uri': uri,
                    'followAllRedirects': true,
                    json: true
                })
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    // Add better handling for different error types
                    reject(err)
                });
        };

        lookup();
    });
};

localStatus.timeToNextCheck = () => {
    var timestamp = new Date().getTime() / 1000;
    return Math.round( (config.localStatus.executionInterval - (timestamp % config.localStatus.executionInterval)) * 1000);
}

localStatus.lastRunning = () => {
    return { status: lastRunninStatus ? 1 : -1, data: lastRunning };
}

localStatus.startChecker = () => {
    console.log('Starting Checker');

    localStatus.check();
}

localStatus.setNextCheck = (time) => {
    // console.log('setting next check in ', localStatus.timeToNextCheck())
    timeoutRef = setTimeout(localStatus.check, time);
}

localStatus.check = () => {
    localStatus.getLocalStatus()
        .then((status) => {
            // Check current running script
            if (localStatus.shouldChangeTimeline(status)) {
                // Change if not same
                localStatus.changeTimeline(status);
            }

            localStatus.setNextCheck(localStatus.timeToNextCheck());
        })
        .catch((error) => {
            // Make retry
            // console.log('Failed Check', error);
            localStatus.setNextCheck(config.localStatus.executionIntervalRetry * 1000);
        });
}

localStatus.shouldChangeTimeline = (data) => {
    if (typeof data['args'] == 'undefined' || typeof data['args']['--playback'] == 'undefined') {
        return false;
    }
    lastData = data;
    return true;
}

localStatus.changeTimeline = (data) => {
    var params = '';
    Object.keys(data.args).forEach((key) => { params = params + ' ' + key + ' ' + data.args[key] });
    OLA.setTimeline(data.command, params)
        .then(() => {
            console.log('Changed timeline to ', data['args']['--playback']);
            lastRunning = data;
            lastRunninStatus = true;
        })
        .catch((error) => {
            lastRunning = error;
            lastRunninStatus = false;
            console.log('Failed chaning timeline.', error);
        });
}

exports.timeToNextCheck = localStatus.timeToNextCheck;
exports.startChecker = localStatus.startChecker;
exports.lastRunning = localStatus.lastRunning;