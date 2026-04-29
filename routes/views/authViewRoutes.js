//server login and logout
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const salesModel = require('../../models/salesModel');
const router = express.Router();

//get /auth/login
router.get('/login', (req, res) => {
    if(req.session.user) {
        return res.redirect('/associate/dashboard');
    }
    res.render('auth/login', {title: 'Login', user: null, error: null});
});

//post /auth/login
router.post('/login', async (req, res) => {
    const {userId, password} = req.body;

    try {
        //admin check
        if(userId === process.env.ADMIN_USER) {
            if(password !== process.env.ADMIN_PASSWORD) {
                return res.render('auth/login', {title: 'Login', user: null, error: 'Incorrect password'});
            }

            req.session.user = {id: 0, name: 'Admin', role: 'admin'};
            return res.redirect('/admin/dashboard');
        }

        //hq check
        if(userId === process.env.HQ_USER) {
            if(password !== process.env.HQ_PASSWORD) {
                return res.render('auth/login', {title: 'Login', user: null, error: 'Incorrect password'});
            }

            req.session.user = {id: 0, name: 'HQ', role: 'hq'};
            return res.redirect('/hq/dashboard');
        }

        //associate check
        const associate = await salesModel.findByUsername(userId);
        if(!associate) {
            return res.render('auth/login', {title: 'Login', user: null, error: 'Incorrect username'});
        }
        //bcrypt password check for associate
        const match = await bcrypt.compare(password, associate.user_pass);
        if(!match) {
            return res.render('auth/login', {title: 'Login', user: null, error: 'Incorrect password'})
        }
        req.session.user = {id: associate.id, name: associate.name, role: 'associate'};
        return res.redirect('/associate/dashboard');
    }
    catch(err) {
        console.error('[authViewRoutes.login]', err);
        res.render('auth/login', {title: 'Login', user: null, error: 'Login issue - try again'});
    }
});

//get /auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/auth/login'));
});

module.exports = router;