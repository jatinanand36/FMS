const logger = require('../utils/logging');
const ApiError = require('../utils/apiError');
const { log, response } = require('../../locale/messages');
const { HTTP_CODES, RESPONSE_STATUS } = require('../../locale/constant');
const feedService = require('../services/feedService'); 
const feedUtil = require('../utils/feedUtil');

// This API is used to search or filter on Feed DB.
exports.getFeed = async (req, res, next) => {
    logger.info({ payload: req.body}, log.info.fetchDetailListOfFeed);
    try {
        const queryParams = {...req.query}; 
        const body = {...req.body};

        let feeds = []; 
        // Parse searchKey String in case of qotes.
        body.filter && body.filter.searchKey ? body.filter.searchKey = feedUtil.parseSerchKeyQuotes(body.filter.searchKey) : null;
        // Fetch total count of Feed via filter query.
        const totalFeeds = await feedService.getFeedCount(body, queryParams);
        // Fetch data of Feed via filter query.
        feeds = await feedService.findFeedBySearchFilter(body, queryParams);
        // Return response.
        return res.status(HTTP_CODES.OK).json({ status:  RESPONSE_STATUS.SUCCESS , msg: response.detailList, total: totalFeeds, data: feeds });

    }catch (err) { 
        logger.error({ err }, log.error.fetchFeedDetails);
        return next (new ApiError( log.error.fetchFeedDetails, HTTP_CODES.BAD_REQUEST));
    }
}