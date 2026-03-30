const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const sharp = require("sharp");
const Blog = require("./models/Blog");
const Event = require("./models/Event");
const EventInquiry = require("./models/EventInquiry");

// ✅ Helper to optimize large images before saving to MongoDB
const optimizeImage = async (base64Str) => {
    if (!base64Str || !base64Str.startsWith("data:image")) return base64Str;
    try {
        const parts = base64Str.split(";base64,");
        const buffer = Buffer.from(parts[1], "base64");
        const resizedBuffer = await sharp(buffer)
            .resize({ width: 1000, withoutEnlargement: true }) // optimized width
            .jpeg({ quality: 80 }) // 80% quality compression
            .toBuffer();
        return `data:image/jpeg;base64,${resizedBuffer.toString("base64")}`;
    } catch (err) {
        console.error("Image optimization failed, saving original:", err.message);
        return base64Str;
    }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "150mb" })); // allowed for initial upload (sharp will shrink it before storage)
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// Error handling for large payloads
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        console.error('Payload too large error:', err);
        return res.status(413).json({ error: 'Payload too large. Please upload a smaller image.' });
    }
    next(err);
});

// MongoDB Connection
mongoose.connect("mongodb+srv://admin:admin123@cluster0.iec1idx.mongodb.net/vrikshDB?retryWrites=true&w=majority")
    .then(() => console.log("✅ MongoDB Connected: vrikshDB successfully connected."))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        console.error("Full details:", err);
    });

// Health Check Route (used by Render to verify the service is up)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Root Route
app.get("/", (req, res) => {
    res.send("Vriksh Backend API is running...");
});


// ================= BLOG APIs =================

// CREATE BLOG
app.post("/blogs", async (req, res) => {
    try {
        const blogData = req.body;
        if (blogData.image) {
            blogData.image = await optimizeImage(blogData.image);
        }
        const blog = new Blog(blogData);
        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL BLOGS (with pagination & optimized payload)
app.get("/blogs", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.max(1, parseInt(req.query.limit) || 12);
        limit = Math.min(limit, 50); // cap page size to avoid huge response
        const skip = (page - 1) * limit;
        const includeContent = req.query.includeContent === "true";
        const includeImage = req.query.includeImage === "true";

        const baseSelect = includeContent ? "" : "-content";
        const selectFields = includeImage ? baseSelect : `${baseSelect} -image`;

        const blogs = await Blog.find()
            .select(selectFields)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Blog.countDocuments();

        res.json({ total, page, limit, data: blogs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE BLOG
app.get("/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE BLOG
app.put("/blogs/:id", async (req, res) => {
    try {
        const blogData = req.body;
        if (blogData.image) {
            blogData.image = await optimizeImage(blogData.image);
        }
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            blogData,
            { new: true }
        );
        res.json(updatedBlog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE BLOG
app.delete("/blogs/:id", async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: "Blog deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= EVENT APIs =================

// CREATE EVENT
app.post("/events", async (req, res) => {
    try {
        const eventData = req.body;
        if (eventData.image) {
            eventData.image = await optimizeImage(eventData.image);
        }
        const event = new Event(eventData);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL EVENTS (with pagination)
app.get("/events", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const events = await Event.find()
            .select("-description") // IMAGE is definitely RESTORED here as well
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE EVENT
app.get("/events/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE EVENT
app.put("/events/:id", async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE EVENT
app.delete("/events/:id", async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ================= EVENT INQUIRY APIs =================

// CREATE EVENT INQUIRY
app.post("/event-inquiries", async (req, res) => {
    try {
        const inquiry = new EventInquiry(req.body);
        await inquiry.save();
        res.json(inquiry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL EVENT INQUIRIES (with pagination)
app.get("/event-inquiries", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const inquiries = await EventInquiry.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE EVENT INQUIRY
app.delete("/event-inquiries/:id", async (req, res) => {
    try {
        await EventInquiry.findByIdAndDelete(req.params.id);
        res.json({ message: "Inquiry deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});