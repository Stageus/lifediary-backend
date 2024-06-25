const errorHandler = (err, req, res, next) => {
  console.log("??");
  console.log(err.message);
  console.log(err.status);
  console.log(err.stack);
  console.log("!!!");

  res.status(err.status || 500).send({ message: err.message || "something broke" });

  // return res.status(err.status || 500).send({
  //   message: "invalid signature",
  // message: err.message || "Something broke",
  // stack: err.stack,
  // });
};

export default errorHandler;
