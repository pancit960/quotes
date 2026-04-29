//Author: Riff Talsma
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const salesModel = require('../models/salesModel');
const router = express.Router();

//login page
router.post('/login', async(req, res) => {
    try {
        const{userId, password} = req.body;
        if(!userId || !password) {
            return res.status(400).json({success: false, message: 'Username and password are both needed'});
        }
        
        //check admin
        if(userId === process.env.ADMIN_USER) {
            //wrong password
            if(password !== process.env.ADMIN_PASSWORD) {
                return res.status(401).json({success: false, message: 'Incorrect password'});
            }
            //successful login
            const token = jwt.sign({id: 0, name: 'Admin', role: 'admin'}, 
                process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || '24h'});
            return res.json({success: true, token, user: {id: 0, name: 'Admin', role: 'admin'}});
        }

        //check hq
        if(userId == process.env.HQ_USER) {
            //wrong password
            if(password !== process.env.HQ_PASSWORD) {
                return res.status(401).json({success: false, message: 'Incorrect password'});
            }
            //successful login
            const token = jwt.sign({id: 0, name: 'HQ', role: 'hq'},
                process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || '24h'});
                return res.json({success: true, token, user: {id: 0, name: 'HQ', role: 'hq'}});
        }

        //check associate login
        const associate = await salesModel.findByUsername(userId)
        if(!associate) {
            return res.status(401).json({success: false, message: 'Incorrect username'});
        }

        const passwordMatch = await bcrypt.compare(password, associate.user_pass);
        //wrong password
        if(!passwordMatch) {
            return res.status(401).json({success: false, message: 'Incorrect password'});
        }
        const token = jwt.sign({id: associate.id, name: associate.name, role: 'associate'},
            process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES || '24h'});
        return res.json({success: true, token, user: {id: associate.id, name: associate.name, role: 'associate'}});        
    }
    //error, we need to fix something with the login
    catch(err) {
        console.error('[authRoutes.login]', err);
        return res.status(500).json({success: false, message: 'Login failed'});
    }
});

module.exports = router;