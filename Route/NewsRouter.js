const express = require('express');
const router = express.Router();
const newsController = require('../Controller/NewsController');

// Create a new news
router.post('/createNews', newsController.createNews);

// Get all news with pagination and search
router.get('/getAllNews', newsController.getAllNews);

// Get news by ID
router.get('/getNewsById/:id', newsController.getNewsById);

// Update news by ID
router.put('/updateNews/:id', newsController.updateNews);

// Delete news by ID
router.delete('/deleteNews/:id', newsController.deleteNews);

module.exports = router;
