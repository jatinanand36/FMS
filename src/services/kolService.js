const KolDetails = require('../models/details');
const { COLLATION, FILTER_SEARCH_KEYS } = require('../../locale/constant');
const mongoose = require('mongoose');


// fetching specific detail from details table
const findDetailList = async (skip, limit, sort) => {
    return await KolDetails.find({},{  kolId : 1, _id : 1, firstName : 1, lastName : 1, suffixes : 1, affiliations : [{isPrimary:true}], areaOfExpertise: 1, }).collation(COLLATION).sort(sort).skip(skip).limit(limit);
};

// fetching the details list
const fetchTotalCount = async () => {
  return await KolDetails.find({}).count();
}

// create Kols.
const create = async (body) => {
  return await KolDetails.create(body);
}

// Update with Set
const updateKolDetailsWithSet = async (query, body) => {
  return await KolDetails.update(query, body);
};

// Fetch Kols by query
const fetchKolDetailsByQuery = async (query) => {
  return await KolDetails.find(query);
};

// Fetch Area Of Expertise from Kol DB
const findAreaOfExpertise = async () => {
  return await KolDetails.distinct( FILTER_SEARCH_KEYS.AREA_OF_EXPERTISE );
};

const findKolBySearchFilter = (body, queryParams) => {
  let query = KolDetails.find({},{affiliation:0});
  const features = new ApiFeature(query, queryParams, body)
    // .filterDeleted()
    .filterSearch()
    // .filterKolId()
    // .filterTerritoriesAndRegions() 
    // .filterAreaOFExpertise()
    .sort()
    .paginate()
  return features.query;
}

// It is used to get the count of Kols via applied filter query.
const getKolCount = (body, queryParams) => {
  const queryParamsWithoutPagination = {...queryParams};
  if(queryParamsWithoutPagination.page)
      delete queryParamsWithoutPagination.page;
  
  if(queryParamsWithoutPagination.limit)
      delete queryParamsWithoutPagination.limit;

  return findKolBySearchFilter(body, queryParamsWithoutPagination).countDocuments();
}

class ApiFeature {
  constructor(query, queryString, body) {
    this.query = query;
    this.queryString = queryString;
    this.filter = body.filter;
  }

  filter() {
    const queryObj = { ...this.queryString };
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
    if (this.filter.searchKey) {
      return this;
    } else if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(FILTER_SEARCH_KEYS.UPDATED_ON_SORT);
    }
    return this;
  }

  paginate() {
    if (this.queryString.page && this.queryString.limit) {
      const page = this.queryString.page * 1 || 1;
      let limit = this.queryString.limit * 1 || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }

  filterTerritoriesAndRegions() {
    let filterTerritoriesAndRegions = [];

    if (this.filter && this.filter.territories && this.filter.territories.length) {
      this.filter.territories.forEach(territory => {
        filterTerritoriesAndRegions.push(territory);
      })
    }

    if (this.filter && this.filter.regions && this.filter.regions.length) {
      this.filter.territories.forEach(regions => {
        filterTerritoriesAndRegions.push(regions);
      })
    }

    if (filterTerritoriesAndRegions.length)
      this.query = this.query.where(FILTER_SEARCH_KEYS.TERRITORIES).in(filterTerritoriesAndRegions);
    return this;
  }

  filterAreaOFExpertise() {
    if(this.filter && this.filter.areaOfExpertise && this.filter.areaOfExpertise.length) {
      this.query = this.query.where(FILTER_SEARCH_KEYS.AREA_OF_EXPERTISE).in(this.filter.areaOfExpertise);
    }
    return this;
  }

  filterDeleted() {
    this.query = this.query.where(FILTER_SEARCH_KEYS.DELETED, false);
    return this;
  }

  filterKolId() {
    if(this.filter && this.filter.kolId) {
      this.query = this.query.where(FILTER_SEARCH_KEYS.KOL_ID).in(this.filter.kolId);
    }
    return this; 
  }

  filterSearch() {
    if (this.filter.searchKey) {
      this.query = this.query.where({ $text: { $search: this.filter.searchKey }})
      // { score: { $meta: FILTER_SEARCH_KEYS.TEXT_SCORE } }
    }
    return this;
  }
 
}


module.exports = {
    findDetailList, fetchTotalCount, create, updateKolDetailsWithSet, fetchKolDetailsByQuery,findKolBySearchFilter, getKolCount, findAreaOfExpertise
};
