let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');

// Assertion Style
chai.should();

chai.use(chaiHttp);

describe('Tasks API', ()=> {
    /**
     *  Test to POST API.
     */
    describe('POST /v1/fms/feed/list', ()=>{
        it('It should GET all the feeds by query params', (done) => {
            let feedSearch = {

            };
            chai.request(server)
            .post('/v1/fms/feed/list?pageNumbers=2&sort=name,dateLastEdited&limit=10')
            .send(feedSearch)
            .end((err, response)=> {
                response.should.have.status(200);
                response.body.should.be.a('object');
                // response.body.length.should.be.eq(10);
                done();
            })
        })

        // it('It should NOT GET all the feeds', (done) => {
        //     chai.request(server)
        //     .get('/feed/lists')
        //     .end((err, response)=> {
        //         response.should.have.status(404); 
        //         done();
        //     })
        // })
    })
})