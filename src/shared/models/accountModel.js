const accountModel = {
  insert: ({ oauthGoogleId, nickname, profileImg }) => {
    return {
      sql: `
          INSERT INTO account (profileImg, nickname, permission, oauthGoogleId) VALUES ($1, $2, $3, $4)
          RETURNING idx, profileImg as "profileImg", permission;
          `,
      values: [profileImg, nickname, "user", oauthGoogleId],
    };
  },
  select: () => {},
  selectFromGoogleId: ({ oauthGoogleId }) => {
    return {
      sql: `
          SELECT idx, permission, profileImg AS "profileImg"
          FROM account
          WHERE oauthGoogleId = $1;
          `,
      values: [oauthGoogleId],
    };
  },
  selectFromIdx: ({ idx }) => {
    return {
      sql: `
            SELECT nickname, profileImg AS "profileImg", subscribeCnt AS "subscribeCnt", diaryCnt AS "diaryCnt"
            FROM account
            WHERE idx = $1 
            `,
      values: [idx],
    };
  },
  delete: () => {},
  updateNickname: () => {},
  updateProfileImg: () => {},
  selectNickname: () => {},
};

export default accountModel;
