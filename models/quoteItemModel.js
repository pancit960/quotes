//Author: Riff Talsma
//data access model for quote description
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

//get line items
async function findByQuote(quoteId) {
    return query(`SELECT * FROM quote_desc WHERE quote_id = ? 
        ORDER BY id ASC`, [quoteId]);
}

//get single item
async function findById(id) {
    const rows = await query(`SELECT * FROM quote_desc WHERE id = ?`, [id]);
    return rows[0] || null;
}

//create quote desc
async function create({quote_id, description, price}) {
    const result = await query(`INSERT INTO quote_desc (quote_id, description, price) 
        VALUES (?, ?, ?)`, [quote_id, description, price]);
    return findById(result.insertId);
}

//update quote description
async function update(id, {description, price}) {
    const fields = [];
    const values = [];
    //push changes if description is defined
    if(description !== undefined) {
        fields.push('description = ?');
        values.push(description);
    }

    //push change if not undefined
    if(price !== undefined) {
        fields.push('price = ?');
        values.push(price);
    }

    if(fields.length === 0) {
        return findById(id);
    }
    values.push(id);

    await query(`UPDATE quote_desc SET ${fields.join(', ')} WHERE id = ?`, values);
    return findById(id);
}

//delete quote description
async function remove(id) {
  const result = await query(`DELETE FROM quote_desc WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

//delete all items from quote
async function removeAllByQuote(quoteId) {
  await query(`DELETE FROM quote_desc WHERE quote_id = ?`, [quoteId]);
}

module.exports = {findByQuote, findById, create, update, remove, removeAllByQuote};


