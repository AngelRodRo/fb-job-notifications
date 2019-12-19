const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema({
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

module.exports = Post;