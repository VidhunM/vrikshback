const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        level: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
         summary: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            required: true
        },
      whatYoullLearn: {
            type: String,
            default: ""
        },
        whoThisSessionIsFor: {
            type: String,
            default: ""
        },
        registrationLink: {
            type: String,
            default: "https://docs.google.com/forms/d/e/1FAIpQLScv1Mc0UCKWzHuRPmqcTKOmR7q6tqSrX9qWJQCtGlh7PbNitg/viewform"
        }
    },
    { timestamps: true }
);

eventSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Event", eventSchema);