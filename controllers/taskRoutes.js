import express from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getMyTasks,
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// Task Routes
// ================================

// Create Task
router.post("/create", protect, createTask);

// Get All Tasks
router.get("/", protect, getTasks);

// Get Logged-in User Tasks
router.get("/mytasks", protect, getMyTasks);

// Get Task By ID
router.get("/:id", protect, getTaskById);

// Update Task
router.put("/:id", protect, updateTask);

// Update Task Status
router.put("/status/:id", protect, updateTaskStatus);

// Delete Task
router.delete("/:id", protect, deleteTask);

export default router;


import express from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getMyTasks,
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// Task Routes
// ================================

// Create Task
router.post("/create", protect, createTask);

// Get All Tasks
router.get("/", protect, getTasks);

// Get Logged-in User Tasks
router.get("/mytasks", protect, getMyTasks);

// Get Task By ID
router.get("/:id", protect, getTaskById);

// Update Task
router.put("/:id", protect, updateTask);

// Update Task Status
router.put("/status/:id", protect, updateTaskStatus);

// Delete Task
router.delete("/:id", protect, deleteTask);

export default router;
