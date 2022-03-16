const logger = require('../utils/logging');
const ApiError = require('../utils/apiError');
const { log, response } = require('../../locale/messages');
const { HTTP_CODES, RESPONSE_STATUS, FILTER_SEARCH_KEYS } = require('../../locale/constant');
const feedService = require('../services/feedService'); 
// const kolUtil = require('../utils/kolUtil');
const mongoose = require('mongoose');

// This API is used to search or filter on Feed DB.
exports.getFeed = async (req, res, next) => {

    logger.info({ payload: req.body}, log.info.fetchDetailListOfFeed);
    try {
        const queryParams = {...req.query}; 
        const body = {...req.body};

        let feeds = [];
        console.log('body.filter.searchKey 1',body.filter.searchKey);
        if(body.filter && body.filter.searchKey) {
            body.filter.searchKey = '"' + body.filter.searchKey.split(",").map(function(item) {
                return item.trim();
            }).join('" "') + '"';
            // if(body.filter.searchKey.includes(''')){

            // }
        }
        console.log('body.filter.searchKey 2',body.filter.searchKey);
        // Fetch total count of Feed via filter query.
        const totalFeeds = await feedService.getFeedCount(body, queryParams);
        console.log('Total Feed',totalFeeds);
        // Fetch data of Feed via filter query.
        feeds = await feedService.findFeedBySearchFilter(body, queryParams);
        // Return response.
        return res.status(HTTP_CODES.OK).json({ status:  RESPONSE_STATUS.SUCCESS , msg: response.detailList, total: totalFeeds, data: feeds });

    }catch (err) { 
        logger.error({ err }, log.error.fetchFeedDetails);
        return next (new ApiError( log.error.fetchFeedDetails, HTTP_CODES.BAD_REQUEST));
    }
}