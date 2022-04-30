const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

/* Validating the request parameter for filter alerts */
const filterSearchFeedList = {
    body: Joi.object().keys({ 
        filter : Joi.object().keys({
            searchKey:  Joi.string().allow('', null),
            pageNumber: Joi.number().positive(),
            limit:  Joi.number().positive(),
            sort: Joi.array().items(Joi.string().allow(null).allow(''))
        })
    })
}

module.exports = {
    filterSearchFeedList
}
