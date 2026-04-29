//connect to legacy DB
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.BLITZ_HOST,
    user: process.env.BLITZ_USER,
    password: process.env.BLITZ_PASSWORD,
    database: process.env.BLITZ_DB,
    port: process.env.BLITZ_PORT
});

connection.connect(function(err) {
    if(err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connection to DB csci467 success!');
});

module.exports = connection;