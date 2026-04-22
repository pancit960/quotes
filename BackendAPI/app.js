//Author: Riff Talsma
require('dotenv').config();
//confirmation of env
//console.log('BLITZ_HOST: ', process.env.BLITZ_HOST);
//console.log('DB_HOST: ', process.env.DB_HOST);
const express = require('express')

const app = express()
var port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

//root
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//controllers
const customerController = require('./controllers/customerController');
const quoteController = require('./controllers/quoteController');
const salesAssociateController = require('./controllers/salesAssociateController');
/*
const orderController = require('./controllers/orderController');
const adminController = require('./controllers/adminController');*/

//home route
app.get('/', (req, res) => {
    res.render('index');
})

//customer route
//app->customerController->customerModel->sql->rows->controller->app->ejs
app.get('/customers', (req, res) => {
    customerController.getAll((data) => {
        res.render('customers', {all : data});
    });
});

//quote routes
app.get('/quotes', (req, res) => {
    quoteController.getAll((data) => {
        res.render('quotes', {all: data});
    });
});

//single quote view
app.get('/quotes/:id', (req, res) => {
    quoteController.getById(req.params.id, (data) => {
        res.render('singleQuote', {quote:data});
    });
})

app.get('/quotes/:id/full', (req, res) => {
    quoteController.getFullQuote(req.params.id, (data) => {
        res.render('fullQuote', data);
    });
})

//test creation of quote
app.get('/testCreateQuote', (req, res) => {
    quoteController.create({
        customer_id: 1,
        sales_id: 1
    }, 
    (id) => {
        res.send('Quote created with ID: ' + id);
    });

});

//sales associate route
app.get("/sales", (req, res) => {
  salesAssociateController.getAll((data) => {
    res.render("sales", { all: data });
  });
});

//add new sales associate
app.post("/sales/add", (req, res) => {
  salesAssociateController.add(req.body, (data) => {
    res.redirect("/sales");
  });
});

//delete existing sales associate
app.get("/sales/:id/delete", (req, res) => {
  salesAssociateController.delete(req.params.id, (data) => {
    res.redirect("/sales");
  });
});
/*

//admin route
app.get('/admin', (req, res) => {
    adminController.dashboard((data) => {
        res.render('admin', {data});
    });
});*/

//start server
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`)
})
