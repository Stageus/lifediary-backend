validator(accountSchema.post)
// validator middleware
error -> 


// accountSchema
const accountSchema = {
  post: [nickname, profileImg],
  putNickname: [nickname],
}

// unit
{
  nickname: body['nickname'].min(6)
}
