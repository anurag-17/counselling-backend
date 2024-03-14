const express = require('express');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} = require("../Controller/CollageController");


// Create a new college
router.post("/createCollege", isAuthenticatedUser, authorizeRoles("admin"), createCollege);

// Get all colleges
router.get("/getAllColleges", getAllColleges);

// Get college by ID
router.get("/getCollegeById/:id", getCollegeById);

// Update college by ID
router.put("/updateCollege/:id", isAuthenticatedUser, authorizeRoles("admin"), updateCollege);

// Delete college by ID
router.delete("/deleteCollege/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteCollege);

module.exports = router;
