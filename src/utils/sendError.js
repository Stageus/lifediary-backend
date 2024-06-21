const sendError = ({ status, message, stack }) => {
  throw { status, message, stack };
};

export default sendError;
