const Course = require("../Model/CoursesModel");

// Create a new course
exports.createCourse = async (req, res, next) => {
  try {
    const newCourse = await Course.create(req.body);
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

// Get all courses
exports.getAllCourses = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
  
      const filter = {};
  
      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }
  
      const totalCount = await Course.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);
  
      const courses = await Course.find(filter)
        .skip((page - 1) * limit)
        .limit(limit);
  
      const pagination = {
        currentPage: page,
        totalPages: totalPages,
        totalCourses: totalCount,
        coursesPerPage: courses.length
      };
  
      res.status(200).json({ courses, pagination });
    } catch (error) {
      next(error);
    }
};

// Get course by ID
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};

// Update course by ID
exports.updateCourse = async (req, res, next) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

// Delete course by ID
exports.deleteCourse = async (req, res, next) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};