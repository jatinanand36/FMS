const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

/* Validating the request parameter for filter alerts */
const filterSearchFeedList = {
    body: Joi.object().keys({ 
        filter : Joi.object().keys({
            searchKey:              Joi.string().allow('', null) 
        })
    })
}

module.exports = {
    filterSearchFeedList
}
