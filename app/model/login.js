'use strict'

var config = require(__base + 'config');

var login = () => {

};

login.isVerified = (req) => {
    return req.isVerified;
}

login.middleware = (req, res, next) => {
    if (req.params.secret && req.params.secret == config.app.secret) {
        req.isVerified = true;
        next();
        return;
    }
    if (req.query.secret && req.query.secret == config.app.secret) {
        req.isVerified = true;
        next();
        return;
    }
    req.isVerified = false;
    next();
}

module.exports = login;