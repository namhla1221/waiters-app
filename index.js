"use strict";
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const Waiter = require('./waiter.js');
const waitersApp = require('./routes')


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

const waiter = Waiter(pool);
const routeInst = waitersApp(waiter);

// let waiter = Waiter(pool);

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

app.get('/', routeInst.home)

app.get('/logout', routeInst.logout)

//this route is for sign-in with the username.
//I t allows users to sign-in and choose job waiter if the user is waiter
app.post('/sigin', routeInst.sigin)

//this is the home page where the user is allowed to create username if it's their first time .


app.get('/waiters/:username', routeInst.username)

//will allow users to select their shifts according to the days they willing to work 
app.post('/waiters/:username', routeInst.waiters)
//this route is for admin to check the schedule of the waiters .
app.get('/days', routeInst.days)

app.get('/clear', routeInst.clear)

app.get('/signup', routeInst.signup)

app.post('/signup', routeInst.sign)




app.listen(PORT, async function (err){
    console.log('App starting on port', PORT)
});
