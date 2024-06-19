import jwt from 'jsonwebtoken'
import jwtConfig from '../configs/jwtConfig.js'

const jwtSign = (obj) => {
  return jwt.sign(obj, process.env.JWT_KEY, jwtConfig)
}

export default jwtSign
