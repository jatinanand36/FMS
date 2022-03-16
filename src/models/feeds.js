const mongoose = require('mongoose');
const { COLLECTIONS } = require('../../locale/constant');

const feeds = new mongoose.Schema({
    name:                 { type: String,text: true }, 
    image:               { type: String  },
    description:             { type: String ,text: true},
    dateLastEdited:             { type: Date, required: true }
});
feeds.index({name: 'text', description : 'text'});

// It is used for debugging purposes.
mongoose.set('debug', function (coll, method, query, doc) {
   console.log('query',query); 
});

const Feeds = mongoose.model(COLLECTIONS.FEEDS, feeds, COLLECTIONS.FEEDS);
module.exports = Feeds;
