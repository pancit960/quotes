const bcrypt = require('bcrypt');
const salesModel = require("../models/salesModel");
//set up bcrypt
const SALT_ROUNDS = 10;

//get /admin/associates page
async function getAll(req, res) {
  try {
    //successfully get all associates
    const associates = await salesModel.findAll();
    res.json({success: true, data: associates});
  }
  catch(err) {
    //if error, find a fix
    console.error('[salesAssociateController.getAll', err);
    res.status(500).json({success: false, message: 'Failed to get a sales associate'});
  }
}

//get /admin/associates/id page
async function getSingle(req, res) {
  try {
    const associate = await salesModel.findById(req.params.id);
    //associate doesnt exist or wrong input
    if(!associate) {
      return res.status(404).json({success: false, message: 'Sales associate could not be found, try again.'});
    }
    //found associate
    res.json({success: true, data: associate});
  }
  //catch err, fix needed if error found
  catch(err) {
    console.error('[salesAssociateController.getSingle]', err);
    res.status(500).json({success: false, message: 'Could not search for a sales associate, needs fix'});
  }
}

//post /admin/associates page
async function create(req, res) {
  try {
    const{id, name, username, password, email_addr, address} = req.body;
    
    //make sure everything for a sales associate is filled out
    if(!id || !name || !username || !password || !email_addr) {
      return res.status(400).json({success: false, message: 'id, name, username, password, and emaill address are needed for new sales associate'});
    }

    //hash the password before storing in database
    const user_pass = await bcrypt.hash(password, SALT_ROUNDS);
    const associate = await salesModel.create({id, name, username, user_pass, email_addr, address});

    //success with creating associate
    res.status(201).json({success: true, data: associate});
  }
  //throw error if could not create
  catch(err) {
    //duplicate entry
    if(err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({success: false, message: 'Associate already exists!'});
    }
    //failure, need to fix somewhere
    console.error('[salesAssociateController.create]', err);
    res.status(500).json({success: false, message: 'Could not create this associate - error'});
  }
}

//put - edit /admin/associates/id page
async function update(req, res) {
  try {
    const{name, username, email_addr, address, password} = req.body;

    //data to updatye
    const data = {name, username, email_addr, address};

    //get password
    if(password) {
      data.user_pass = await bcrypt.hash(password, SALT_ROUNDS);
    }
    const associate = await salesModel.update(req.params.id, data);

    if(!associate) {
      return res.status(404).json({success: false, message: 'Associate could not be found'})
    }
    //successfully update associate
    res.json({success: true, data: associate});
  }
  //for some reason could not update the associate
  catch(err) {
    console.error('[salesAssociateController.update]', err);
    res.status(500).json({success: false, message: 'Could not update sales associate'});
  }
}

// delete associate - /admin/associates/id page
async function remove(req, res) {
  try {
    const deleted = await salesModel.remove(req.params.id);

    if(!deleted) {
      return res.status(404).json({success: false, message: 'Could not find sales associate'});
    }
    res.json({success: true, message: 'Deleted sales associate!'});
  }
  catch(err) {
    console.error('[salesAssociateController.remove]', err);
    res.status(500).json({success: false, message: 'Could not delete associate - error'});
  }
}

module.exports = { getAll, getSingle, create, update, remove};