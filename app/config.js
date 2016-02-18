var config = module.exports = {
    id: 'ola_service',
    app: {
        port: 8080,
        secret: 'b0b08afd3c17cab4d91148ab3b686f5d'
    },
    logProperty: {
        logDirectory: './logs/',
        fileNamePattern: 'ola_service-<DATE>.log',
        dateFormat: 'YYYY-MM-DD'
    },
    localStatus: {
        // addr: 'http://localhost',
        addr: 'http://192.168.12.151',
        port: 80,
        extension: '/status/get_current',
        executionInterval: 60, // Seconds
        executionIntervalRetry: 2 // Seconds
    },
    ola: {
        manualSettingTimeout: 30 // Seconds
    }
};
