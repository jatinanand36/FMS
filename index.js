const config = require('config');
const app = require('./src/app');
const mongoose = require('mongoose');
const DB = config.get('dbConfig.hostUri');

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
.then(() => console.log('DB connection successful!'))
.catch((err) => console.log('Error while connecting DB', err));

const port = process.env.PORT || 8080;

module.exports = app.listen(port, () => {
  console.log(`FMS Service is running on port ${port}...`);
});
