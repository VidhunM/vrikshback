const mongoose = require("mongoose");

const eventInquirySchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        location: { type: String, required: true },
        topicInterestedIn: { type: String, required: true },
        background: { type: String, required: true },
        heardAboutUs: { type: String, required: true },
        message: { type: String, required: true },
        consent: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("EventInquiry", eventInquirySchema);