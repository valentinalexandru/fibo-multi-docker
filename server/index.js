const keys = require('./keys');

// Define and set up the express part of the app
const express = require('express');

const bodyParser = require('body-parser');
// CORS = Cross Origin Resource Sharing 
const cors = require('cors');

// The app object will receive and respond to any HTTP request
// coming or going back to the React server
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setup the Postgres client

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

// Create a table in the db to store the calculated values

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

// Redis Client Setup

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// The purpose for these copies is that in the redis documentation
// it is stated that when a connection is subscribed or listening
// for information then it cannot be used for other purposes

const redisPublisher = redisClient.duplicate();

// Express route handlers

// Test route to see if the app is behaving the way we expect it to

app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    // look at the values table, pull everything from it
    const values = await pgClient.query('SELECT * from values');
    // then send it to what is making requests to the route
    res.send(values.rows);
});

// Retreive from redis all of the
// indeces and values that have been calculated

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

// Route handler that receives new values from the React app

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Number too big (>40)');
    }

    redisClient.hset('values', index, 'No calculated values');
    redisPublisher.publish('insert', index);
    // Take the index and store it perm. in postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening on port 5000');
  });