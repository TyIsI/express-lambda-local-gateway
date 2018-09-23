'use strict';
console.log('Loading function: test');

exports.handler = (event, context, callback) => {
    console.dir('Received event:', event);
    console.dir('Received context:', context);

    if (event.custom_result != undefined)
        return callback({
            result: event.custom_result
        });

    return callback(null, {
        result: "OK"
    });
};
