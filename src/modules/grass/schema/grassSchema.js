const grassSchema = {
  get: {
    year: {
      in: ["query"],
      isInt: true,
      notEmpty: true,
      optional: true,
      isLength: { options: { min: 4, max: 4 } },
    },
  },
};

export default grassSchema;
