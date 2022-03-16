const kolService = require('../services/kolService');
const { log, response } = require('../../locale/messages');
const logger = require('../utils/logging');
const kolClientService = require('../services/kolClientService');  
const mongoose = require('mongoose');

const createKolUsingJOSN = async (JSONArray) => {
    for (let kol of JSONArray) {
        let kolObj = { ...kol };
        kolObj.academicTitle = kolObj.academicTitle.split(';'); 
        kolObj.areaOfExpertise = kolObj.areaOfExpertise.split(';');
        kolObj.suffixes = kolObj.suffixes.split(';');
        kolObj.updatedOn = new Date().toISOString();
        kolObj.createdOn = new Date().toISOString();
        kolObj.deleted = false;
        let createdKol = await kolService.create(kolObj);
        logger.debug({ payload: createdKol }, response.createKol);
    }
}

// <TO-DO> : I have to write unit test for this function.
const catogerizeJSONArray = (JSONArray) => { 
    // Fetch Disctinct values of KolID.
    let kolIds = new Set(JSONArray.map((i)=>{return i.kolId}));
    let result = [];
    for(let id of kolIds) {
        let obj = {};
        obj.kolId = id;
        let roles = JSONArray.filter((i)=> {return i.kolId === id});
        if(roles && roles.length) {
            let updatedRoles = [];
            for(let role of roles) {
                delete role.kolId;
                updatedRoles.push(role);
            }
            obj.data = updatedRoles; 
        }
        result.push(obj);
    }
     return result;
}

// Update Role and Responsbilities data of Kol.
const updateRoles = async (JSONArray) => {
    let catogerizedArray = catogerizeJSONArray(JSONArray);       
    for(let role of catogerizedArray) {
        await kolService.updateKolDetailsWithSet({kolId : role.kolId}, { $set : { rolesAndResponsibilities : role.data}});
    }
}

// Update Education data of Kol.
const updateEducation = async (JSONArray) => {
    let catogerizedArray = catogerizeJSONArray(JSONArray); 
    console.log('catogerizedArray',catogerizedArray)      
    for(let role of catogerizedArray) {
        console.log({kolId : role.kolId}, { $set : { educations : JSON.stringify(role.data)}})
        await kolService.updateKolDetailsWithSet({kolId : role.kolId}, { $set : { educations : role.data}});
    }
}

// Update Honours and Awards data of Kol.
const updateHonoursAndAwards = async (JSONArray) => {
    let catogerizedArray = catogerizeJSONArray(JSONArray);       
    for(let role of catogerizedArray) {
        await kolService.updateKolDetailsWithSet({kolId : role.kolId}, { $set : { honoursAndAwards : role.data}});
    }
}

// Update Publication data of Kol.
const updatePublications = async (JSONArray) => {
    let catogerizedArray = catogerizeJSONArray(JSONArray);       
    for(let role of catogerizedArray) {
        await kolService.updateKolDetailsWithSet({kolId : role.kolId}, { $set : { publications : role.data}});
    }
}

// Update Clinical Trails data of Kol.
const updateClinicalTrials = async (JSONArray) => {
    let catogerizedArray = catogerizeJSONArray(JSONArray);       
    for(let role of catogerizedArray) {
        await kolService.updateKolDetailsWithSet({kolId : role.kolId}, { $set : { clinicalTrials : role.data}});
    }
}

// Update Affiliation data of Kol.
const updateAffiliations = async (JSONArray) => {
    let catogerizedArray = catogerizeJSONArray(JSONArray);
    for(let role of catogerizedArray) { 
        await kolService.updateKolDetailsWithSet({kolId : role.kolId}, { $set : { affiliations : role.data}});
    }
}

const modifyDetailList = async (kolDetailsList) => {
  let kolModifiedDetailList = kolDetailsList.map( (kolData) => {
    let modifyAffiliationsData = [];
       kolData.affiliations.forEach( ( affilationData) => {
          if( affilationData.isPrimary == true || affilationData.isPrimary == "true"){
              let arrayOfaffilationRole =  affilationData.role.split(',');
              let arrayOfaffilationCompanyOrAuthorityName = affilationData.companyOrAuthorityName.split(',');
              let arrayOfaffilationAuthorityAddress = affilationData.authorityAddress.split(',');
              let arrayOfaffilationYear = affilationData.year ? `${affilationData.year}`.split(','):'';
              let arrayOfaffilationCountry = affilationData.country.split(',');
              modifyAffiliationsData.push(...[].concat.apply([], [arrayOfaffilationRole, arrayOfaffilationCompanyOrAuthorityName,arrayOfaffilationAuthorityAddress,arrayOfaffilationAuthorityAddress,arrayOfaffilationCountry,arrayOfaffilationYear]))
          }
      })
      kolData.affiliations = [...modifyAffiliationsData]
      return kolData
  } )
  return kolModifiedDetailList;
}

const createKolClientUsingJOSN = async (JSONArray, companies) => {
    for (let kol of JSONArray) {
        let kolObj = { ...kol };
        kolObj.clients = kolObj.clients.split(';'); 
        let clients = kolObj.clients;
        let clientIds = [];
        // Replace CompanyId by CompanyName
        for(let client of clients) { 
            let clientInput = client; 
            let clientObj = companies.find((i)=>{ return clientInput  == i.name });
            clientObj && clientObj._id ? clientIds.push(clientObj._id) : null;
        }
        kolObj.clients = clientIds;
        // Convert Company Type : String to Mongo ObjectId.
        kolObj.clients = kolObj.clients && kolObj.clients.length ? kolObj.clients.map((i)=>{return mongoose.mongo.ObjectId(i)}) : [];
        kolObj.updatedOn = new Date().toISOString();
        kolObj.createdOn = new Date().toISOString();
        // Insert kolClient Object.
        let createdKolClient = await kolClientService.create(kolObj);
        logger.debug({ payload: createdKolClient }, response.createKOLClient);
    }
}


module.exports = {
    createKolUsingJOSN,
    updateRoles,
    updateEducation,
    updateHonoursAndAwards,
    updatePublications,
    updateClinicalTrials,
    updateAffiliations,
    modifyDetailList,
    createKolClientUsingJOSN
}
