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
        const body = {...req.body};

        // Parse searchKey String in case of qotes.
        body.filter && body.filter.searchKey ? body.filter.searchKey = feedUtil.parseSerchKeyQuotes(body.filter.searchKey) : null;
        // Fetch data of Feed via filter query.
        let result = await feedService.findFeedBySearchFilter(body);
        // Return response.
        return res.status(HTTP_CODES.OK).json({ status:  RESPONSE_STATUS.SUCCESS , msg: response.detailList, total: result.total, data: result.searched });

    }catch (err) { 
        logger.error({ err }, log.error.fetchFeedDetails);
        return next (new ApiError( log.error.fetchFeedDetails, HTTP_CODES.BAD_REQUEST));
    }
}