'use strict';
console.log('Loading function: test');

exports.handler = (event, context, callback) => {
    console.dir('Received event:', event);
    console.dir('Received context:', context);

    return callback(null, {
        result: "PONG",
        timestamp: Date.now()
    });
};
