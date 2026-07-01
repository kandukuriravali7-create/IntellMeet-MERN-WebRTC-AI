import express from "express";

import {
    sendMessage,
    getMeetingChat,
    deleteMessage
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================
// Chat Routes
// =====================================

// Send Message
router.post("/send", protect, sendMessage);

// Get All Messages of a Meeting
router.get("/:meetingId", protect, getMeetingChat);

// Delete Message
router.delete("/:id", protect, deleteMessage);

export default router;
