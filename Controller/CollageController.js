const College = require("../Model/CollageModel");

// Create a new college
exports.createCollege = async (req, res, next) => {
  try {
    const newCollege = await College.create(req.body);
    res.status(201).json(newCollege);
  } catch (error) {
    next(error);
  }
};

// Get all colleges
exports.getAllColleges = async (req, res, next) => {
  const { city, state } = req.query;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (state) {
      filter.state = state;
    }

    if (city) {
      filter.city = city;
    }

    const totalCount = await College.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const colleges = await College.find(filter)
      .populate('courses')
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalColleges: totalCount,
      collegesPerPage: colleges.length
    };

    res.status(200).json({ colleges, pagination });
  } catch (error) {
    next(error);
  }
};

// Get college by ID
exports.getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).populate('courses');
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }
    res.status(200).json(college);
  } catch (error) {
    next(error);
  }
};

// Update college by ID
exports.updateCollege = async (req, res, next) => {
  try {
    const updatedCollege = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCollege) {
      return res.status(404).json({ message: "College not found" });
    }
    res.status(200).json(updatedCollege);
  } catch (error) {
    next(error);
  }
};

// Delete college by ID
exports.deleteCollege = async (req, res, next) => {
  try {
    const deletedCollege = await College.findByIdAndDelete(req.params.id);
    if (!deletedCollege) {
      return res.status(404).json({ message: "College not found" });
    }
    res.status(200).json({ message: "College deleted successfully" });
  } catch (error) {
    next(error);
  }
};
