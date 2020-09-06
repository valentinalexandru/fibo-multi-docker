// Keys for connecting to the redis and postgres instances

module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.RESIS_PORT,

    //Postgres settings

    pgUser: process.env.PGUSER,
    pgHost: process.env.PGHOST,

    // db name

    pgDatabase: process.env.PGDATABASE,

    // db password

    pgPassword: process.env.PGPASSWORD,

    //db port

    pgPort: process.env.PGPORT
};