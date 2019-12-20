const Post = require("../models/post");
const Keyword = require("../models/post");

Post.post('save', async (doc) => {
    console.log('%s has been saved', doc._id);
});