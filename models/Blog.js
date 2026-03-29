const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "Counselling"
    },
    slug: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Blog", BlogSchema);