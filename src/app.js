require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { checkOverload } = require('./helpers/check.connect');
const compression = require('compression');
const app = express();

// init middleware:
app.use( morgan("dev") )
app.use(helmet());
app.use(compression());

// init db
//require('./dbs/init.mongoseDB.lv0'); //no single ton
// apply single ton:
require('./dbs/init.mongoseDB');

//checkOverload(); // check status DB

// init router:
//require('./routers/RapidMQ.router')(app);


//handling error


module.exports = app;
