//Author: Riff Talsma
const connection = require('../db/connection');

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
};