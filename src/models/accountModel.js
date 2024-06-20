import psqlPool from "../utils/psqlPool.js";

const accountModel = {
  insert: () => {},
  selectFromIdx: async ({ idx }) => {
    const sql = `
              SELECT nickname, profileImg, subscribeCnt, diaryCnt
              FROM account
              WHERE idx = $1;
              `;
    const values = [idx];
    const selectedResult = await psqlPool.query(sql, values);
    const account = selectedResult.rows[0];

    return account;
  },
  selectFromGoogleId: async ({ id }) => {
    const sql = `
              SELECT *
              FROM account
              WHERE oauthGoogleId = $1;
              `;
    const values = [id];
    const selectedResult = await psqlPool.query(sql, values);
    const account = selectedResult.rows[0];

    return account;
  },
  delete: () => {},
  updateNickname: () => {},
  updateProfileImg: () => {},
  selectNickname: () => {},
};

export default accountModel;
