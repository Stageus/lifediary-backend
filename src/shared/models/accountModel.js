const accountModel = {
  insert: () => {},
  select: () => {},
  selectFromGoogleId: ({ oauthGoogleId }) => {
    return {
      sql: `
      SELECT *
      FROM account
      WHERE oauthGoogleId = $1;
    `,
      values: [oauthGoogleId],
    };
  },
  delete: () => {},
  updateNickname: () => {},
  updateProfileImg: () => {},
  selectNickname: () => {},
};

export default accountModel;
