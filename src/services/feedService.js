const feeds = require('../../assets/jsons/mock_data.json'); 

const inMemoryOperations = {
  pagination: (array, page, limit) => {
    let feedsOfFeeds = [];
    while (array.length) {
      feedsOfFeeds.push(array.splice(0, limit))
    }
    return feedsOfFeeds[page - 1] || [];
  },
  sort: (array, key) => {
    return array.sort(function (a, b) {
      let first = a[key];
      let second = b[key];
      return ((first < second) ? -1 : ((first > second) ? 1 : 0));
    });
  }
}

const findFeedBySearchFilter = (body) => {
  let search = body.filter && body.filter.searchKey ? body.filter.searchKey : '';
  let sort = body.filter && body.filter.sort ? body.filter.sort : [];
  let pageNumber = body.filter && body.filter.pageNumber ? body.filter.pageNumber : '';
  let limit = body.filter && body.filter.limit ? body.filter.limit : [];
  let arrayString = [];
 
  let searchedArr = [];
  if (search.length) {
    if (search[0] == `"` && search[search.length - 1] == `"`) {
      // DOUBLE QUOTED
      arrayString = search.substring(1, search.length - 1).split(" ");
      searchedArr = feeds.filter((i) => {
        let flag1, flag2, f1 = [], f2 = [];
        for (let j of arrayString) {
          flag1 = flag1 || i.description.includes(j);
          flag2 = flag2 || i.name.includes(j);
        }
        return flag1 || flag2;
      })
    } else {
      // SINGLE QUOTED
      arrayString = search.split(" ");
      searchedArr = feeds.filter((i) => {
        let flag1, flag2, f1 = [], f2 = [];
        for (let j of arrayString) {
          flag1 = flag1 || i.description.toLocaleLowerCase().includes(j.toLowerCase());
          flag2 = flag2 || i.name.toLocaleLowerCase().includes(j.toLowerCase());
        }
        return flag1 || flag2;
      })
    }
  } else {
    searchedArr = [...feeds];
  }

  // Pagination
  let paginatedArr = [...searchedArr];
  if (pageNumber && limit) {
    paginatedArr = inMemoryOperations.pagination(paginatedArr, pageNumber, limit);
  }

  // Sort
  let sortedArr = [...paginatedArr];
  if (paginatedArr.length) {
    for (let i of sort) {
      sortedArr = inMemoryOperations.sort(paginatedArr, i);
    }
  }
  return {
    searched : sortedArr,
    total : searchedArr.length
  };
}


module.exports = {
    findFeedBySearchFilter
};

