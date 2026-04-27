//Author: riff Talsma
//uses orderdb table
const connection = require('../db/studentConnection');

//Promise wrap for read
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
        if (err) { 
            return reject(err);
        }
        resolve(results);
        });
    });
}


//get single order by order id
async function findById(id) {
const rows = await query(`SELECT o.*, q.customer_name, q.customer_email, q.associate_id, a.name AS associate_name 
    FROM orderdb o JOIN quotes q ON q.id = o.quote_id JOIN associate_data a ON a.id = q.associate_id 
    WHERE o.id = ?`, [id]);

    return rows[0] || null;
}


//get order by quote id
async function findByQuoteId(quoteId) {
    const rows = await query(`SELECT o.*, q.customer_name, q.customer_email, q.associate_id, a.name AS associate_name 
        FROM orderdb o JOIN quotes q ON q.id = o.quote_id JOIN associate_data a ON a.id = q.associate_id
        WHERE o.quote_id = ?`, [quoteId]);
    return rows[0] || null;
}

//get all orders - only admin
 
async function findAll() {
    return query(`SELECT o.*, q.customer_name, q.customer_email, q.quote_status, a.name AS associate_name 
        FROM orderdb o JOIN quotes q ON q.id = o.quote_id JOIN associate_data a ON a.id = q.associate_id 
        ORDER BY o.created DESC`);
}

//create new order
async function create({
    quoteId,
    quoteDiscount,
    commissionAmt,
    commissionRate,
    quoteAmount
}) {
    const result = await query(`INSERT INTO orderdb (quote_id, quote_discount, commission_amt, commission_rate, quote_amount)
    VALUES (?, ?, ?, ?, ?)`, [quoteId, quoteDiscount, commissionAmt, commissionRate, quoteAmount]);

    return findById(result.insertId);
}

module.exports = {findById, findByQuoteId, findAll, create};