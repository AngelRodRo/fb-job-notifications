const express = require('express');
const router = express.Router();

const Post = require('../models/post');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const posts = await Post.find({});
  return res.json(posts);
});

module.exports = router;