// API keys for the redis database
const keys = require('./keys');

const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,

    /* If the redis client loses the connection to the redis server
    then retry the connection every 1 second (1000ms) */

    retry_strategy: () => 1000
});

// Create a duplicate of the redis client

const sub = redisClient.duplicate();

// Recursive implementation of the fibonacci algorithm

function fibonacci(number) {
    if (number < 2) return 1;
    return fibonacci(number - 1) + fibonacci(number - 2);
}

/* Everytime a value shows up in redis, call the fibonacci
function on it and store the result in a hash called values, 
with the key being "message", the number we received  */

sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert');