import express from "express";

import {
    saveSummary,
    getSummary,
    updateSummary,
    deleteSummary,
    generateAISummary
} from "../controllers/summaryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================================
// AI Summary Routes
// ========================================

// Save Meeting Summary
router.post("/save", protect, saveSummary);

// Generate AI Summary
router.post("/generate", protect, generateAISummary);

// Get Summary by Meeting ID
router.get("/:meetingId", protect, getSummary);

// Update Summary
router.put("/:id", protect, updateSummary);

// Delete Summary
router.delete("/:id", protect, deleteSummary);

export default router;

server/app.js
Add Import
import summaryRoutes from "./routes/summaryRoutes.js";
Add Route
app.use("/api/summary", summaryRoutes);

Now your app.js should look like this:

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/summary", summaryRoutes);
