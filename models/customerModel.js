//Author: Riff Talsma
//This is read only, so we will do a promise wrap
const connection = require('../db/connection');
 
//Promise, controllers will use async and await
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });
}
 
//cleaned up the searches
 
//return all customers for search or dropdown functions as needed in our web app
async function findAll() {
    //I could do select * but this is better for explicit listing from our external db
    return query(`SELECT id, name, city, street, contact FROM customers ORDER BY name ASC`);
}
 
//get single customer by id
async function findById(id) {
    const rows = await query(`SELECT id, name, city, street, contact FROM customers 
        WHERE id = ?`, [id]);
    return rows[0] || null;
}
 
//new addition
//this will search by a name, city, or contact email if we want to enter it in a quote
//will take search term entered by associate
async function search(term) {
    const like = `%${term}%`;
    return query(
        `SELECT id, name, city, street, contact FROM customers 
        WHERE name LIKE ? OR city LIKE ? OR contact LIKE ? 
        ORDER BY name ASC LIMIT 50`, [like, like, like] //where our search terms go
    )
}
 
module.exports = {findAll, findById, search};
/*
module.exports = {
    //get ALL customers
    getAll: async (result) => {
        connection.query('SELECT * FROM customers', function(err, rows) {
            if(err) throw err;
            result(rows);
        });
    },
 
    //get one customer by ID
    getById: async (id, result) => {
        connection.query('SELECT * FROM customers WHERE id = ?', [id],
        function(err, rows) {
            if(err) throw err;
            result(rows[0]);
        });
    }  
};*/
 