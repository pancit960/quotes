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
};
