const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Blog = require("./models/Blog");
const Event = require("./models/Event");
const EventInquiry = require("./models/EventInquiry");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

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
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Test Route
app.get("/", (req, res) => {
    res.send("API is running");
});


// ================= BLOG APIs =================

// CREATE BLOG
app.post("/blogs", async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL BLOGS
app.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE BLOG
app.get("/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE BLOG
app.put("/blogs/:id", async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
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
        const event = new Event(req.body);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL EVENTS
app.get("/events", async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
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

// GET ALL EVENT INQUIRIES
app.get("/event-inquiries", async (req, res) => {
    try {
        const inquiries = await EventInquiry.find().sort({ createdAt: -1 });
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
app.listen(5000, () => {
    console.log("Server running on port 5000");
});