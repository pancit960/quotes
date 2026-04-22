//Author: Riff Talsma
//this will connect to mariaDB so we can store things such as quotes
//customers will be imported via blitz
var mysql = require('mysql')

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(function(err) {
    if(err) {
        console.error('MariaDB connection failure: ', err);
        return;
    }
    console.log('Connected to MariaDB database');
});

module.exports = connection;