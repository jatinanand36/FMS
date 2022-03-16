
const response = {
    detailList: 'Fetched Feed list Successfully!'
}

const log = {
    info: {
        fetchDetailListOfFeed: 'Received payload for fetching Feed details'
    },
    debug: {
    },
    warn: { 
    },
    error: {
        fetchFeedDetails: 'Fetch Feed list Failed!',
        validationError: 'Error in validating object'
    }
}

module.exports = {
    log, response
};
