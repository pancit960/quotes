// AUTHOR: Leyla Kucukkaya

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
      "INSERT INTO associate_data (name, user_pass, commission, address, email_addr, username) VALUES (?, ?, ?, ?, ?, ?)",
      [
        id.name,
        id.password,
        id.commission,
        id.address,
        id.email_addr,
        id.username,
      ],
      function (err, rows) {
        if (err) throw err;
        result(rows[0]);
      },
    );
  },

  //delete existing associate
  delete: async (id, result) => {
    connection.query(
      "DELETE FROM associate_data WHERE id = ?",
      [id],
      function (err, rows) {
        if (err) throw err;
        result(rows[0]);
      },
    );
  },

  //edit existing associate
  edit: async (id, result) => {
    connection.query(
      "UPDATE associate_data SET name = ?, username = ?, user_pass = ?, email_addr = ?, commission = ?, address = ? WHERE id = ?",
      [
        id.name,
        id.username,
        id.password,
        id.email_addr,
        id.commission,
        id.address,
        id.id,
      ],
      function (err, rows) {
        if (err) throw err;
        result(rows[0]);
      },
    );
  },
};
