'use strict'

var exec = require('child_process').exec

var OLA = () => {}

var last_timeline = {
    command: null,
    args: null
};
var timeout_ref = null;

OLA.getStatus = () => {
    return new Promise((resolve, reject) => {
        // exec('ola_dev_info', (error, stdout, stderr) => {
        exec('uptime', (error, stdout, stderr) => {
            if (error == null) {
                resolve(stdout);
                return;
            }
            console.log(error)
            reject(error);
        })
    })
}

OLA.setDMX = (universe, dmx, timeout) => {
    timeout_ref = setTimeout(OLA.resetToLastTimeline, timeout);

    return new Promise((resolve, reject) => {
        var exec_string = `ola_set_dmx -u ${universe} -d ${dmx}`;
        exec(exec_string, (error, stdout, stderr) => {
            if (error == null) {
                resolve(stdout);
                return;
            }
            reject('Command failed');
        })
    })
}

OLA.resetToLastTimeline = () => {
    timeout_ref = null;
    if (
        last_timeline.command != null &&
        last_timeline.args != null
        ) {
        return OLA.setTimeline(last_timeline.command, last_timeline.args, true);
    }
    return false;
}

OLA.setTimeline = (command, args, resume) => {
    if (typeof resume == 'undefined') {
        resume = false;
    }
    if (!resume) {
        // Saving last used
        last_timeline.command = command;
        last_timeline.args = args;
    }

    return new Promise((resolve, reject) => {
        if (Array.isArray(args)) {
            args = args.reduce((prev, value, arg) => { return `${prev} ${arg} ${value}` }, '');
        }
        var exec_string = `${command} ${args}`;
        exec(exec_string, (error, stdout, stderr) => {
            if (error == null) {
                resolve(stdout);
                return;
            }
            reject(error);
        })
    })
}


module.exports = OLA;