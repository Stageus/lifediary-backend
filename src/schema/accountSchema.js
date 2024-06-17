const accountSchema = {
  post: [
    body('profileImg').max(100), //
    body('nickname').max(10).min(2),
  ],
}

export default accountSchema
