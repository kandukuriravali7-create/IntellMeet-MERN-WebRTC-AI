import express from "express";

import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
} from "../controllers/meetingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================
// Meeting Routes
// =============================

// Create Meeting
router.post("/create", protect, createMeeting);

// Get All Meetings
router.get("/", protect, getMeetings);

// Get Meeting By ID
router.get("/:id", protect, getMeetingById);

// Update Meeting
router.put("/:id", protect, updateMeeting);

// Delete Meeting
router.delete("/:id", protect, deleteMeeting);

// Join Meeting by Code
router.post("/join", protect, joinMeeting);

export default router;
