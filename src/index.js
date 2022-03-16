const config = require('config');
const app = require('./app');
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

app.listen(port, () => {
  console.log(`FMS Service is running on port ${port}...`);
});
