//Author: Riff Talsma
require('dotenv').config();
//confirmation of env
//console.log('BLITZ_HOST: ', process.env.BLITZ_HOST);
//console.log('DB_HOST: ', process.env.DB_HOST);
console.log("JWT_SECRET: ", process.env.JWT_SECRET);
const path = require('path')
const express = require('express')
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

//view routes
const authViewRoutes = require('./routes/views/authViewRoutes');
const associateViewRoutes = require('./routes/views/associateViewRoutes');


const app = express();
var port = process.env.PORT || 3000;

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//store session data so you stay logged in
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 24 * 60 * 60 * 1000} //= 24 hour cookie
}));

//ejs view routes
//redirect index / to login page
app.get('/', (req, res) => res.redirect('/auth/login'));
app.use('/auth', authViewRoutes);
app.use('/associate', associateViewRoutes);

//routes
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/quotes', quoteRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

//check health
app.get('/health', (_req, res) => res.json({status: 'Good!'}));

//404 catch
app.use((_req, res) => {
    res.status(404).json({success: false, message: '404 Error, could not get route'})
});

//global error
app.use((err, _req, res, _next) => {
    console.error('[Unhandled error]', err);
    res.status(500).json({success: false, message: 'Internal server error.'});
});


app.listen(port, () => { 
    console.log(`Server running on port ${port}`);
})

module.exports.app;
