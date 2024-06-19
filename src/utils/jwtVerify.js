import jwt from 'jsonwebtoken'

const jwtVerify = (token) => {
  return !!token && jwt.verify(token, process.env.JWT_KEY)
}

export default jwtVerify
