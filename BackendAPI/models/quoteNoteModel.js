//Author: Riff Talsma
//this will provide our secret notes
const db = require('../db/studentConnection');

module.exports = {
    getNotesByQuote: (id, cb) => {
        db.query('SELECT * FROM secret_notes WHERE quote_id = ?', [id], (err, rows) => {
            if(err) throw err;
            cb(rows);
        });
    }
};