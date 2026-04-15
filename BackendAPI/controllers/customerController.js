//Author: Riff Talsma
const customerModel = require('../models/customerModel');

module.exports = {
    //get all customers
    getAll: (cb) => {
        customerModel.getAll((rows) => {
            cb(rows);
        });
    },

    //get one customer via ID
    getById: (id, cb) => {
        customerModel.getById(id, (row) => {
            cb(row);
        });
    }

};