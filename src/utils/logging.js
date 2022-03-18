const config = require('config');
const bunyan = require('bunyan');

  /* This is the same as bunyan.stdSerializers.req but without headers */
  requestSerializer = (req) => {
    if (!req || !req.connection) {
      return req;
    }

    return {
      method: req.method,
      url: req.url,
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort
    };
  }

const logger = bunyan.createLogger({
  name: config.get('log.service'),
  level: config.get("log.level"),
  serializers: {
    req: requestSerializer,
    err: bunyan.stdSerializers.err
  }
});

module.exports = logger;
