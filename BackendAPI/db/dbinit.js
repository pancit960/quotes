//Author: Riff Talsma
require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

//connect to sql
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.connect(err => {
    if (err) {
        console.error("Connection failed:", err.message);
        return;
    }
    console.log("Connected to MariaDB");

    //create db if not exists
    connection.query(
        `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
        (err) => {
            if (err) throw err;
            console.log("Database created/confirmed");

            //switch DB
            connection.query(`USE ${process.env.DB_NAME}`, () => {

                //read SQL file
                const sqlFile = fs.readFileSync(
                    path.join(__dirname, '..', 'database.sql'),
                    'utf8'
                );

                const statements = sqlFile
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length);

                let pending = statements.length;

                //execute
                statements.forEach((stmt) => {
                    connection.query(stmt, (err) => {
                        if (err) {
                            console.error("SQL Error:", err.sqlMessage || err);
                        } else {
                            console.log("Executed:", stmt);
                        }

                        pending--;

                        if(pending === 0) {
                            connection.end();
                            console.log("DB init complete")
                        }
                    });
                });

                
            });
        }
    );
});