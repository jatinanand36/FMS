const Feeds = require('../models/feeds');
const { COLLATION, FILTER_SEARCH_KEYS } = require('../../locale/constant');
const mongoose = require('mongoose');

// It is used to get the count of Feeds via applied filter query.
const getFeedCount = (body, queryParams) => {
    const queryParamsWithoutPagination = {...queryParams};
    if(queryParamsWithoutPagination.page)
        delete queryParamsWithoutPagination.page;
    
    if(queryParamsWithoutPagination.limit)
        delete queryParamsWithoutPagination.limit;
  
    return findFeedBySearchFilter(body, queryParamsWithoutPagination).countDocuments();
}

const findFeedBySearchFilter = (body, queryParams) => {
    let query = Feeds.find({},{affiliation:0});
    console.log('Query PArams',queryParams);
    const features = new ApiFeature(query, queryParams, body)
      .filterSearch()
      .sort()
      .paginate()
    return features.query;
}

class ApiFeature {
    constructor(query, queryString, body) {  
      this.query = query;
      this.queryString = queryString;
      this.filter = body.filter;
    }
  
    filter() {
      const queryObj = { ...this.queryString };
      console.log('queryObj',queryObj );
      const excludedFields = [FILTER_SEARCH_KEYS.PAGE, FILTER_SEARCH_KEYS.SORT, FILTER_SEARCH_KEYS.LIMIT];
      excludedFields.forEach(el => delete queryObj[el]);
      
      // Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      console.log('queryStr 1',queryStr);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      console.log('queryStr 2',queryStr);
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
  
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log('Soprtby',sortBy)
            this.query = this.query.sort(sortBy);
            return this;
        }
    }
    paginate() {
      if (this.queryString.pageNumbers && this.queryString.limit) {
        const page = this.queryString.pageNumbers * 1 || 1;
        let limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
      }
      return this;
    }
  
    filterSearch() {
      if (this.filter && this.filter.searchKey) {
        this.query = this.query.where({ $text: { $search: this.filter.searchKey }});
      }
      return this;
    }
   
}


module.exports = {
    findFeedBySearchFilter, getFeedCount
};

