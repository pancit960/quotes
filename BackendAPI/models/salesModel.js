const connection = require("../db/connection");

module.exports = {
  //get ALL associates
  getAll: async (result) => {
    connection.query("SELECT * FROM associate_data", function (err, rows) {
      if (err) throw err;
      result(rows);
    });
  },

  //get one associate by ID
  getById: async (id, result) => {
    connection.query(
      "SELECT * FROM associate_data WHERE id = ?",
      [id],
      function (err, rows) {
        if (err) throw err;
        result(rows[0]);
      },
    );
  },

  //add new associate
  add: async (id, result) => {
    connection.query(
      "INSERT INTO associate_data (name, user_pass, commission, address) VALUES (?, ?, ?, ?)",
      [id.name, id.password, id.commission, id.address],
      function (err, rows) {
        if (err) throw err;
        result(rows[0]);
      },
    );
  },

  //delete existing associate
  delete: async (id, result) => {
    connection.query(
      "DELETE FROM associate_data WHERE user_id = ?",
      [id],
      function (err, rows) {
        if (err) throw err;
        result(rows[0]);
      },
    );
  },
};
