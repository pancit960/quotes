//Author: Riff Talsma
//Model for our quote items
const db = require('../db/studentConnection');

module.exports = {
    getItemsByQuote: (id, cb) => {
        db.query(`SELECT * FROM  quote_desc WHERE quote_id = ?`, [id], (err, rows) => {
            if(err) throw err;
            cb(rows);
        });
    }
};

