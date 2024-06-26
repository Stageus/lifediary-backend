const errorHandler = (err, req, res, next) => {
  return res.status(err.status || 500).send({
    message: err.message,
    stack: err.stack,
  });
};

export default errorHandler;
