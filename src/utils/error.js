const errorHandler = (err, req, res, next) => {
    let { statusCode , message} = err;
    res.status(statusCode).send({
      status: "error",
      statusCode: statusCode || 500,
      msg: message,
    });
};

module.exports = errorHandler;