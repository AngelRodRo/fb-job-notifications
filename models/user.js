const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: "Username is required"
    },
    email: {
        type: String,
        unique: true,
        required: "Email is required"
    },
    password: {
        type: String,
        required: "Password is required"
    },
    keywords: [{
        type: mongoose.Schema.Keyword.ObjectId,
        ref: 'Keyword'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", UserSchema);

User.exists = (filter) => exists(User, filter);
User.findOrCreate = (filter, data) => findOrCreate(User, filter, data);

module.exports = User;