const mongoose = require("mongoose");
const { exists, findOrCreate } = require("../utils/models");
const { Schema } = mongoose;

const PostSchema = new Schema({
    postId: {
        type: String,
        unique: true,
        required: "PostId is required"
    },
    groupId: {
        type: String,
        required: "Group is required"
    },
    content: {
        type: String,
        required: "content is required"
    },
    link: {
        type: String,
        required: "Link is required"
    },
    date: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model("Post", PostSchema);

Post.exists = (filter) => exists(Post, filter);
Post.findOrCreate = (filter, data) => findOrCreate(Post, filter, data);

module.exports = Post;