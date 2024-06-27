import logger from "../logger/logger.js";

const interceptor = (req, res, next) => {
  const originalSend = res.send;
  const startTime = performance.now();

  res.on("finish", () => {
    logger(req, res);
  });

  res.send = function (body) {
    try {
      res.locals.responseTime = `${(performance.now() - startTime).toFixed(2)}ms`;
      if (res.statusCode.toString().startsWith("2")) {
        res.locals.modifiedBody = { message: "success", result: body || undefined };
      } //
      else if (res.statusCode.toString().startsWith("4") || res.statusCode.toString().startsWith("5")) {
        res.locals.modifiedBody = { message: body.message };
        res.locals.stack = body.stack || undefined;
      }

      res.send = originalSend;
      return originalSend.call(this, res.locals.modifiedBody);
    } catch (err) {
      return next(err);
    }
  };

  next();
};

export default interceptor;
