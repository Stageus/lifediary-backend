import diaryModel from "../../../shared/models/diaryModel.js";
import jwt from "../../../shared/utils/jwt.js";
import psqlConnect from "../../../shared/utils/psqlConnect.js";

const grassService = {
  selectComments: async (req, res) => {
    const { year } = req.query;
    const { accountIdx } = jwt.verify(req.headers.token);

    const result = await psqlConnect.query(diaryModel.selectGrass({ accountIdx: accountIdx, year: year }));

    return result.rows;
  },
};

export default grassService;
