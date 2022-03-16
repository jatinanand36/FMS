const express = require('express');

const validate = require('../validation/validate');
const feedValidation = require('../validation/feedValidation');
const feedController = require('../controllers/feedController');

const router = express.Router();

router.route('/list').post(validate(feedValidation.filterSearchFeedList),feedController.getFeed);

module.exports = router;
