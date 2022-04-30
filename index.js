const config = require('config');
const app = require('./src/app');

const port = process.env.PORT || 8080;

module.exports = app.listen(port, () => {
  console.log(`FMS Service is running on port ${port}...`);
});
