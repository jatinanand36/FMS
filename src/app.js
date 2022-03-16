const express = require('express');
const bodyParser = require('body-parser');
const config = require('config')
const cors = require('cors');
const errorHandler = require('./utils/error'); 
const feedRoutes = require('./routes/feedRoutes'); 
const app = express();
const APP_URL = config.get('APP_URL');
app.disable("x-powered-by");
app.use(cors({
  "origin": APP_URL,
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}));
app.use(bodyParser.json());

/* Defined routes */
app.use('/v1/fms/feed/',feedRoutes);  

app.all('*', (req, res) => {
  res.status(404).send(`Can't find ${req.originalUrl} on this server!`);
});

/*Global Error handler */
app.use(errorHandler);

module.exports = app;
