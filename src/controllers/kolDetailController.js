const logger = require('../utils/logging');
const ApiError = require('../utils/apiError');
const { log, response } = require('../../locale/messages');
const { HTTP_CODES, RESPONSE_STATUS, KOL_TABS_CSV_NAME, FILTER_SEARCH_KEYS, ROLES } = require('../../locale/constant');
const csv = require('csvtojson');
const kolService = require('../services/kolService');
const imsService = require('../services/imsService');
const kolUtil = require('../utils/kolUtil');
const config = require('config');
const kolClientService = require('../services/kolClientService');
const mongoose = require('mongoose');

// This API is used to upload KOLs details.
exports.uploadDetails = async (req, res, next) => {
    logger.info({ query: req.query }, log.info.payloadStatusFetch);
    let body = req.body;
    // detailsPath
    try {
        const jsonKOLs = await csv().fromFile(body.filePath);
        if (body.filePath.includes(KOL_TABS_CSV_NAME.ROLE)) {
            // Upload KOLs Roles using JSONs.
            await kolUtil.updateRoles(jsonKOLs);
        } else if (body.filePath.includes(KOL_TABS_CSV_NAME.EDUCATION)) {
            // Upload KOLs Education using JSONs.
            await kolUtil.updateEducation(jsonKOLs);
        } else if (body.filePath.includes(KOL_TABS_CSV_NAME.HONOURS_AND_AWARDS)) {
            // Upload KOLs Honours and Awards using JSONs.
            await kolUtil.updateHonoursAndAwards(jsonKOLs);
        } else if (body.filePath.includes(KOL_TABS_CSV_NAME.PUBLICATIONS)) {
            // Upload KOLs Publications using JSONs.
            await kolUtil.updatePublications(jsonKOLs);
        } else if (body.filePath.includes(KOL_TABS_CSV_NAME.CLINICAL_TRIALS)) {
            // Upload KOLs Clinical Trails using JSONs.
            await kolUtil.updateClinicalTrials(jsonKOLs);
        } else if (body.filePath.includes(KOL_TABS_CSV_NAME.OTHER_AFFILIATIONS)) {
            // Upload KOLs Affiliations using JSONs.
            await kolUtil.updateAffiliations(jsonKOLs);
        } else if (body.filePath.includes(KOL_TABS_CSV_NAME.KOL_CLIENT)){
            // Fetch all companies from IMS.
            let companies = await imsService.getCompanyListByQuery();
            companies = companies && companies.data && companies.data.data ? companies.data.data : [];
     
            // Map Company Name by CompanyId and upload KOLs Details using JSONs.
            await kolUtil.createKolClientUsingJOSN(jsonKOLs, companies);
        }        
        else {
            // Upload KOLs Details using JSONs.
            await kolUtil.createKolUsingJOSN(jsonKOLs);
        }

        logger.debug({ payload: body }, log.info.uploadDetails);
        return res.status(HTTP_CODES.OK).json({ 'status': RESPONSE_STATUS.SUCCESS, 'msg': response.uploadDetails, 'data': jsonKOLs });
    }
    catch (err) {
        console.log(err);
        logger.error({ err }, log.error.uploadDetails);
        return next(new ApiError(log.error.uploadDetails, HTTP_CODES.BAD_REQUEST));
    }
}

// fetch detail list 
exports.listKolDetails = async (req, res, next) => {
    logger.info({payload: req.body}, log.info.fetchDetailListOfKol);
    try{
       let page = req.query.page ? parseInt(req.query.page) : 1;
       let limit = req.query.limit ? parseInt(req.query.limit) : 0;
       let skip =  (page - 1) * limit;
       let kolDetailsList = await kolService.findDetailList(skip, limit, { firstName: 1 });
       let modifiedKolDetailList = await kolUtil.modifyDetailList(kolDetailsList);
       if (!modifiedKolDetailList.length) {
          logger.error({ kolDetailsList : modifiedKolDetailList }, log.error.fetchKolDetails);
          return res.json({
              "status": RESPONSE_STATUS.ERROR,
              "sub_status": null,
              "msg": log.error.fetchKolDetails,
              "data": kolDetailsList
          });
      }
      let total = await kolService.fetchTotalCount();
      logger.debug({ query : req.body }, response.detailList);
      return res.status(HTTP_CODES.OK).json({ 'status': RESPONSE_STATUS.SUCCESS, msg : response.detailList, data: {modifiedKolDetailList, total ,page, limit} });
    }
    catch (err){
       logger.error({ err : err }, log.error.fetchKolDetails);
       return next(new ApiError(log.error.fetchKolDetails, HTTP_CODES.BAD_REQUEST));
    }
}
// This API is used to search or filter on Kol DB.
exports.getKol = async (req, res, next) => {

    logger.info({ payload: req.body}, log.info.fetchDetailListOfKol);
    try {
        const queryParams = {...req.query}; 
        const body = {...req.body};
        const userInfo = req.body.userInfo;

        let kols = [];
        if(body.filter && body.filter.searchKey) {
            body.filter.searchKey = '"' + body.filter.searchKey.split(",").map(function(item) {
                return item.trim();
            }).join('" "') + '"';
        }
        // Check for client case : Kol 
        if(userInfo.role === ROLES.CLIENT) {
            let companyId = userInfo.userCompany;
            // Fetch Kol Ids, who have companyId.
            let kolClient = await kolClientService.find({ clients : { $in : [ mongoose.mongo.ObjectId(companyId) ] }}, { kolId :1 });
            let kolIds = kolClient && kolClient.length ? kolClient.map((i)=>{return i.kolId}) : [];
            // Finalise filter kolId input.
            if( body.filter && body.filter.kolId ){
                 if(kolIds && kolIds.length && !kolIds.includes(body.filter.kolId)){ 
                    body.filter.kolId = [];
                 } 
            } else {
                body.filter.kolId = kolIds;
            } 
        } 

        // Fetch total count of Kol via filter query.
        const totalKol = await kolService.getKolCount(body, queryParams);
        // Fetch data of Kol via filter query.
        kols = await kolService.findKolBySearchFilter(body, queryParams);
        // Add photo field in Kol.
        for(let kol of kols) {
            kol._doc.photo =  (config.get(FILTER_SEARCH_KEYS.API_URL) instanceof Array ? config.get(FILTER_SEARCH_KEYS.API_URL)[0] : config.get(FILTER_SEARCH_KEYS.API_URL)) 
                            + FILTER_SEARCH_KEYS.KOL_PROFILE_ACCESS_API + kol._doc.photo;
        }
        return res.status(HTTP_CODES.OK).json({ status:  RESPONSE_STATUS.SUCCESS , msg: response.detailList, total: totalKol, data: kols });

    }catch (err) { 
        logger.error({ err }, log.error.fetchKolDetails);
        return next (new ApiError( log.error.fetchKolDetails, HTTP_CODES.BAD_REQUEST));
    }
}

// This API is used to list of Area Of Expertise on Kol DB.
exports.getAreaOfExpertise = async (req, res, next) => {
    logger.info({ payload: req.body}, log.info.listAreaOfExpertise);
    try { 
        // Fetch data of area of expertise from Kol DB.
        let areaOfExpertises = await kolService.findAreaOfExpertise();
        
        return res.status(HTTP_CODES.OK).json({ status:  RESPONSE_STATUS.SUCCESS , msg: response.listAreaOfExpertise, total: areaOfExpertises.length , data: areaOfExpertises });

    }catch (err) { 
        logger.error({ err }, log.error.listAreaOfExpertise);
        return next (new ApiError( log.error.listAreaOfExpertise, HTTP_CODES.BAD_REQUEST));
    }
}
