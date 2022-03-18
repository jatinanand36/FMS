let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let feedUtil = require('../src/utils/feedUtil');
let assert = require('chai').assert;
// Assertion Style
chai.should();

chai.use(chaiHttp);

describe('Tasks API', ()=> {
    /**
     *  Test to POST API.
     */
    describe('POST /v1/fms/feed/list', ()=>{
        // For Success test cases.    
        it('It should fetch all the feeds by query params', (done) => {
            let feedSearch = {
            };
            chai.request(server)
            .post('/v1/fms/feed/list?pageNumbers=2&sort=name,dateLastEdited&limit=10')
            .send(feedSearch)
            .end((err, response)=> { 
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('status').eq("success");
                response.body.should.have.property('msg').eq("Fetched Feed list Successfully!");
                response.body.should.have.property('total').eq(100);
                response.body.should.have.deep.property('data');
                done();
            })
        })
        // For Failure test cases.
        it('It should NOT fetch all the feeds', (done) => {
             chai.request(server)
            .post('/v1/fms/feed/lists')
            .end((err, response)=> {
                response.should.have.status(404); 
                done();
            })
        })
    })

    /**
     *  Unit Test Cases of Util Methods
     */
    describe('Feed Utils', () => {
        // For single quotes string
        it('parseSerchKeyQuotes should return parsed string from single quotes', ()=> {
            let result = feedUtil.parseSerchKeyQuotes(`'the king'`);
            assert.equal(result,`"the king"`)
        })
        // For double quotes string
        it('parseSerchKeyQuotes should return parsed string from double quotes', ()=> {
            let result = feedUtil.parseSerchKeyQuotes(`"the king"`);
            assert.equal(result,`"the king"`)
        })
    })
})