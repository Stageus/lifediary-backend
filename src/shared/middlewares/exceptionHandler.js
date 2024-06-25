const exceptionHandler = (req, res, next) => {
  return res.status(404).json({ message: "404 Not Found" });
};

export default exceptionHandler;
