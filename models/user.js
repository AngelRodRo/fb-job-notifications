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
    keywords: {
        type: "Array",
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;