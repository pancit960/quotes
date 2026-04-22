//Author: Riff Talsma
const db = require('../db/studentConnection');

module.exports = {
    //CREATE QUOTE
    create: (data, cb) => {
        const sql = `INSERT INTO quotes (customer_id, sales_id, sanctioned, time_created)
        VALUES (?, ?, 'NO', NOW())`;

        db.query(sql, [data.customer_id, data.sales_id], (err, result) => {
            if(err) throw err;
            cb(result.insertId);
        });
    },

    //GET ALL QUOTES
    getAll: (cb) => {
        db.query('SELECT * FROM quotes', (err, rows) => {
            if(err) throw err;
            cb(rows);
        });
    },

    //get single quote
    getById: (id, cb) => {
        db.query('SELECT * FROM quotes WHERE id = ?', [id], (err, rows) => {
            if(err) throw err;
            cb(rows[0]);
        });
    }
};