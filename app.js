const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");

const indexRouter = require('./routes/index');

const MONGO_URI = "mongodb://localhost/jobsDB";
mongoose
.connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => console.log('DB Connected!'))
    .catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
});

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

module.exports = app;
