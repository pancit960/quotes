//Author: Riff Talsma
//This will provide read only access to our legacy database provided in the project
//Need id, name, city, street, contact info
const customerModel = require("../models/customerModel");

//return all customers
async function getAll(req, res) {
  try {
    const customers = await customerModel.findAll();
    res.render("customers", { customers });
  } catch (err) {
    //debug for group
    console.error("[customerController.getAll]", err);
    res.status(500).json({
      success: false,
      message:
        "Could not retrieve all customers from external legacy database. FIX THIS!",
    });
  }
}

//return single customer by id
async function getSingle(req, res) {
  try {
    const customer = await customerModel.findById(req.params.id);
    if (!customer) {
      //throw error 404 cus we aint got the customer
      return res
        .status(404)
        .json({ success: false, message: "Could not find customer." });
    }
    return res.json({
      success: true,
      data: customer,
    });
  } catch (err) {
    console.error("[customerController.getSingle]", err);
    res.status(500).json({
      success: false,
      nessage: "Function failed to search a customer.",
    });
  }
}

//search for a customer by name, city or contact info
async function search(req, res) {
  try {
    const term = req.query.q || "";
    if (!term.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Search term (q) is required." });
    }
    const customers = await customerModel.search(term);
    res.json({ success: true, data: customers });
  } catch (err) {
    console.error("[customerController.search]", err);
    res.status(500).json({
      success: false,
      message: "Function failed to search a customer",
    });
  }
}

module.exports = { getAll, getSingle, search };

//clean up this code and make sure we use the stuff in our database
/*
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
 
};*/
