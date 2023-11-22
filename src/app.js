require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { checkOverload } = require('./helpers/check.connect');
const compression = require('compression');
const app = express();

// init middleware:
app.use( morgan("dev") );
app.use(helmet());
app.use(compression());

// allow prameter from body and work with json :
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


// init db
//require('./dbs/init.mongoseDB.lv0'); //no single ton
require('./dbs/init.mongoseDB');// apply single ton

//checkOverload(); // check status DB

// init router:
//require('./routers/RapidMQ.router')(app);
app.use('/', require('./routers/index'));


//handling error


module.exports = app;
