// AUTHOR: Leyla Kucukkaya
//Edit: match w/ customerModel
const connection = require("../db/studentConnection");

//use a promise like in customerModel
function query(sql, params =[]) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
}

//get ALL associates
async function findAll() {
    return query(`SELECT id, name, username, email_addr, address, commission 
        FROM associate_data 
        ORDER BY name ASC`);
}

//get one associate by ID
async function findById(id) {
    const rows = await query(`SELECT id, name, username, email_addr, address, commission 
        FROM associate_data 
        WHERE id = ?`, [id]);
    return rows[0] || null;
}

//get associate by username
async function findByUsername(username) {
    const rows = await query(`SELECT * FROM associate_data 
        WHERE username = ?`, [username]);
    return rows[0] || null;
}


//create new associate
async function create({name, username, user_pass, email_addr, address}) {
    const result = await query(`INSERT INTO associate_data (name, username, user_pass, email_addr, address) 
        VALUES (?, ?, ?, ?, ?)`, 
        [name, username, user_pass, email_addr, address || null]);
    return findById(result.insertId);
}

//edit associate
async function update(id, data) {
    const allowed = ['name', 'username', 'email_addr', 'address', 'user_pass'];
    const fields = [];
    const values = [];

    for(const key of allowed) {
        if(data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    if(fields.length === 0) {
        return findById(id);
    }
    values.push(id);

    await query(`UPDATE associate_data SET ${fields.join(', ')} WHERE id = ?`, values);

    return findById(id);
}

//remove associate
async function remove(id) {
    const result = await query(`DELETE FROM associate_data WHERE id = ?`, [id]);

    return result.affectedRows > 0;
}

//add commission to associate
async function addCommission(id, amount) {
    await query(`UPDATE associate_data SET commission = commission + ? 
        WHERE id = ?`, [amount, id]);
    return findById(id);
}


module.exports = {findAll, findById, findByUsername, create, update, remove, addCommission};