//Author: Riff Talsma
//this will provide our secret notes
const db = require('../db/studentConnection');

//Promise our connection to our db
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
}

//get all notes for quote
async function findByQuote(quoteId) {
  return query(`SELECT sn.*, ad.name AS associate_name FROM secret_notes sn 
    LEFT JOIN associate_data ad ON ad.id = sn.associate_id 
    WHERE sn.quote_id = ? ORDER BY sn.id ASC`, [quoteId]);
}

//create new note
async function create({quoteId, note, associateId, noteAuthor
}) {
  const result = await query(`INSERT INTO secret_notes (quote_id, associate_id, note_author, note) 
    VALUES (?, ?, ?, ?)`, [quoteId, associateId, noteAuthor, note]);

  const rows = await query(`SELECT * FROM secret_notes WHERE id = ?`, [result.insertId]);

  return rows[0];
}

//delete current note
async function remove(id) {
  const result = await query(`DELETE FROM secret_notes WHERE id = ?`, [id]);

  return result.affectedRows > 0;
}

module.exports = {findByQuote, create, remove};