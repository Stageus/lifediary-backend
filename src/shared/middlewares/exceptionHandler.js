const exceptionHandler = (req, res, next) => {
  return res.status(404).send({ message: "404 Not Found" });
};

export default exceptionHandler;
