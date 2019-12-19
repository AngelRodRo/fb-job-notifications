const express = require('express');
const router = express.Router();
const user = require("../models/user");

router.get('/', function(req, res, next) {
  res.json('Hello Guys');
});

module.exports = router;
