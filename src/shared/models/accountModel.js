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

  selectFromIdx: ({ accountIdx }) => {
    return {
      sql: `
            SELECT nickname, profileImg AS "profileImg", subscribeCnt AS "subscribeCnt", diaryCnt AS "diaryCnt"
            FROM account
            WHERE idx = $1 
            `,

      values: [accountIdx],
    };
  },
  
  delete: ({ accountIdx }) => {
    return {
      sql: `
          DELETE 
          FROM account
          WHERE idx = $1
          `,
      values: [accountIdx],
    };
  },

  selectNickname: ({ nickname }) => {
    return {
      sql: `
            SELECT idx
            FROM account
            WHERE nickname = $1
            `,
      values: [nickname],
    };
  },
  
  updateNickname: ({ nickname, accountIdx }) => {
    return {
      sql: `
            UPDATE account
            SET nickname = $1
            WHERE idx = $2
            RETURNING idx;
          `,
      values: [nickname, accountIdx],
    };
  },

  updateProfileImg: ({ profileImg, accountIdx }) => {
    return {
      sql: `
            UPDATE account
            SET profileImg = $1
            WHERE idx = $2
            RETURNING idx;
          `,
      values: [profileImg, accountIdx],
    };
  },

};

export default accountModel;
