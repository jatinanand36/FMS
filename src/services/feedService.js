const Feeds = require('../models/feeds'); 

// It is used to get the count of Feeds via applied filter query.
const getFeedCount = (body, queryParams) => {
    const queryParamsWithoutPagination = {...queryParams};
    if(queryParamsWithoutPagination.pageNumbers)
        delete queryParamsWithoutPagination.pageNumbers;
    
    if(queryParamsWithoutPagination.limit)
        delete queryParamsWithoutPagination.limit;
  
    return findFeedBySearchFilter(body, queryParamsWithoutPagination).countDocuments();
}

// It is used to get feeds via applied filter query.
const findFeedBySearchFilter = (body, queryParams) => {
    let query = Feeds.find({},{affiliation:0}); 
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
  
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
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

