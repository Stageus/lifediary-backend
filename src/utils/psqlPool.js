import pg from 'pg'
import psqlConfig from '../configs/psqlConfig.js'

const psqlPool = new pg.Pool(psqlConfig)
export default psqlPool
