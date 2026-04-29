//Author: Riff Talsma
//will be our quote access
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

//compute totals
async function _recompute(quoteId) {
    const subtotalRows = await query(`SELECT COALESCE(SUM(price), 0) AS subtotal FROM quote_desc
        WHERE quote_id = ?`, [quoteId]);

    const subtotal = parseFloat(subtotalRows[0].subtotal) || 0;

    //discount info
    const quoteRows = await query(`SELECT discount_type, discount_val
    FROM quotes WHERE id = ?`, [quoteId]);

    const q = quoteRows[0];
    let discountAmt = 0;

    if(q && q.discount_type === 'amount') {
        discountAmt = parseFloat(q.discount_val) || 0;
    }
    else if(q && q.discount_type === 'percentage') {
        discountAmt = (subtotal * (parseFloat(q.discount_val) || 0)) / 100;
    }

    //calculate discount
    const final_total = Math.max(0, subtotal - discountAmt);
    await query(`UPDATE quotes SET subtotal = ?, final_total = ?, discount_final = ? 
        WHERE id = ?`, [subtotal, final_total, discountAmt, quoteId]);

    return {subtotal, final_total};
}

//Public

//single quote
async function findById(id) {
    const rows = await query(`SELECT * FROM quotes WHERE id = ?`, [id]);
    return rows[0] || null;
}

//quote search
async function search({
  status, dateFrom, dateTo, associateId, customerId
} = {}) {
  const conditions = [];
  const values = [];

    if(status) { 
        conditions.push('q.quote_status = ?'); 
        values.push(status); 
    }
    if(dateFrom) { 
        conditions.push('DATE(q.created_at) >= ?'); 
        values.push(dateFrom); 
    }
    if(dateTo) { 
        conditions.push('DATE(q.created_at) <= ?'); 
        values.push(dateTo); 
    }
    if(associateId) { 
        conditions.push('q.associate_id = ?');
        values.push(associateId); 
    }
    if(customerId) { 
        conditions.push('q.customer_id = ?'); 
        values.push(customerId); 
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return query(`SELECT q.*, a.name AS associate_name FROM quotes q 
        JOIN associate_data a ON a.id = q.associate_id 
        ${where} ORDER BY q.created_at DESC`, values);
}

//quotes by associate
async function findByAssociate(associateId) {
  return query(`SELECT * FROM quotes WHERE associate_id = ? 
    ORDER BY created_at DESC`, [associateId]);
}

//finalized and processed quotes
async function findFinished() {
    return query(`SELECT q.*, a.name AS associate_name FROM quotes q 
        JOIN associate_data a ON a.id = q.associate_id 
        WHERE q.quote_status IN ('finalized', 'sanctioned', 'ordered') 
        ORDER BY q.created_at DESC`);
}

//create a quote
async function create({
    associate_id, customer_id, customer_name, customer_email
}) {
    const result = await query(`INSERT INTO quotes 
        (associate_id, customer_id, customer_name, customer_email) 
        VALUES (?, ?, ? , ?)`, [associate_id, customer_id, customer_name, customer_email]);
    return findById(result.insertId);
}

//update quote
async function update(id, data) {
    const allowed = ['customer_email', 'discount_type', 'discount_val', 'discount_final', 
        'quote_status', 'finalized_at', 'sanctioned_at', 'ordered_at', 'commission_pct', 
        'commission_total', 'processing_date'];
    const fields = [];
    const values = [];

    //
    for(const key of allowed) {
        if(data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    //if we have data to update
    if(fields.length > 0) {
        values.push(id);
        await query(`UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    await _recompute(id);
    return findById(id);
}

//force recompute
async function recomputeTotals(id) {
    await _recompute(id);
    return findById(id);
}

//delete quote
async function remove(id) {
    const result = await query(`DELETE FROM quotes WHERE id = ?`, [id]);
    //check for affect data
    return result.affectedRows > 0;
}

module.exports = {findById, search, findByAssociate, findFinished, create, update, recomputeTotals, remove};