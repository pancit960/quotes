const salesModel = require("../models/salesModel");

module.exports = {
  //get all sales associates
  getAll: (cb) => {
    salesModel.getAll((rows) => {
      cb(rows);
    });
  },

  //get one sales associate via ID
  getById: (id, cb) => {
    salesModel.getById(id, (row) => {
      cb(row);
    });
  },
};
