//connect to legacy DB
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'blitz.cs.niu.edu',
    user: 'student',
    password: 'student',
    database: 'csci467',
    port: 3306 
});

connection.connect(function(err) {
    if(err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connection to DB csci467 success!');
});

module.exports = connection;