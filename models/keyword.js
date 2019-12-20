const mongoose = require("mongoose");
const { Schema } = mongoose;

const KeywordSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: "name is required"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Keyword = mongoose.model("Keyword", KeywordSchema);

Keyword.exists = (filter) => exists(Keyword, filter);
Keyword.findOrCreate = (filter, data) => findOrCreate(Keyword, filter, data);

module.exports = Keyword;