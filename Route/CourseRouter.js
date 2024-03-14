const express = require('express');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../Controller/CoursesController");

// Create a new course
router.post("/createCourse", isAuthenticatedUser, authorizeRoles("admin"), createCourse);

// Get all courses 
router.get("/getAllCourses", getAllCourses);

// Get course by ID
router.get("/getCourseById/:id", getCourseById);

// Update course by ID
router.put("/updateCourse/:id", isAuthenticatedUser, authorizeRoles("admin"), updateCourse);

// Delete course by ID
router.delete("/deleteCourse/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteCourse);

module.exports = router;
