require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const Blog = require("./models/Blog");
const Event = require("./models/Event");

// ✅ Cloudinary Configuration (using the same logic as server.js)
cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@cluster0.iec1idx.mongodb.net/vrikshDB?retryWrites=true&w=majority";

// ✅ Helper to upload base64 image to Cloudinary (same as server.js)
const uploadToCloudinary = async (base64Str, folder = "vriksh") => {
    if (!base64Str || !base64Str.startsWith("data:image")) return base64Str;
    try {
        const result = await cloudinary.uploader.upload(base64Str, {
            folder: folder,
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto"
        });
        return result.secure_url;
    } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        return null; // Return null so we can handle failure
    }
};

async function migrateImages() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB Connected.");

        // Migration for Blogs
        console.log("\n--- Starting Blog Migration ---");
        const blogsToUpdate = await Blog.find({ image: { $regex: /^data:image/ } });
        console.log(`Found ${blogsToUpdate.length} blogs with base64 images.`);

        for (let blog of blogsToUpdate) {
            console.log(`Uploading image for blog: ${blog.title}...`);
            const imageUrl = await uploadToCloudinary(blog.image, "vriksh/blogs");
            if (imageUrl) {
                await Blog.updateOne({ _id: blog._id }, { $set: { image: imageUrl } });
                console.log(`✅ Updated blog: ${blog.title}`);
            } else {
                console.error(`❌ Failed to migrate blog: ${blog.title}`);
            }
        }

        // Migration for Events
        console.log("\n--- Starting Event Migration ---");
        const eventsToUpdate = await Event.find({ image: { $regex: /^data:image/ } });
        console.log(`Found ${eventsToUpdate.length} events with base64 images.`);

        for (let event of eventsToUpdate) {
            console.log(`Uploading image for event: ${event.title}...`);
            const imageUrl = await uploadToCloudinary(event.image, "vriksh/events");
            if (imageUrl) {
                await Event.updateOne({ _id: event._id }, { $set: { image: imageUrl } });
                console.log(`✅ Updated event: ${event.title}`);
            } else {
                console.error(`❌ Failed to migrate event: ${event.title}`);
            }
        }


        console.log("\n--- Migration Complete ---");
        process.exit(0);
    } catch (err) {
        console.error("Migration fatal error:", err);
        process.exit(1);
    }
}

migrateImages();
