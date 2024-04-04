const News = require("../Model/NewsModel");

// Create a new news
exports.createNews = async (req, res, next) => {
  try {
    const newNews = await News.create(req.body);
    res.status(201).json(newNews);
  } catch (error) {
    next(error);
  }
};

// Get all news with pagination and search
exports.getAllNews = async (req, res, next) => {
  const { page, limit, search } = req.query;
  try {
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const searchTerm = search || '';

    const filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm, $options: 'i' };
    }

    const totalCount = await News.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const news = await News.find(filter)
      .skip((pageNumber - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    const pagination = {
      currentPage: pageNumber,
      totalPages: totalPages,
      totalNews: totalCount,
      newsPerPage: news.length
    };

    res.status(200).json({ news, pagination });
  } catch (error) {
    next(error);
  }
};

// Get news by ID
exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json(news);
  } catch (error) {
    next(error);
  }
};

// Update news by ID
exports.updateNews = async (req, res, next) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedNews) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json(updatedNews);
  } catch (error) {
    next(error);
  }
};

// Delete news by ID
exports.deleteNews = async (req, res, next) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    next(error);
  }
};
