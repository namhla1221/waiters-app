"use strict";
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const Waiter = require('./waiter.js');


const app = express();

let PORT = process.env.PORT || 1030;

app.use(express.static('public'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

//database connection 
const pg = require('pg');
const Pool = pg.Pool;



let useSSL = false;
if (process.env.DATABASE_URL) {
    useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://namz:namhla1221@localhost:5432/my_waiters';

const pool = new Pool({
    connectionString,
    // ssl: useSSL
});
let waiter = Waiter(pool);

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        checkedDays: function () {
            if (this.checked) {
                return 'checked';
            }
        }
    }

}));

app.set('view engine', 'handlebars');

