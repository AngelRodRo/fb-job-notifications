const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const scrappingService = require('./index');
const cors = require('cors');

const indexRouter = require('./routes/index');

const MONGO_URI = "mongodb://localhost/jobsDB";
mongoose
.connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => scrappingService(["remote", "job", "vue", "react", "node"]))
    .catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
});

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', indexRouter);
module.exports = app;