import express from 'express'
import accountController from './src/controllers/accountController.js'

const app = express()
const port = 4000

app.get('/', accountController.signup)
app.get('/error', accountController.error)

app.use((err, req, res, next) => {
  console.log(err)
  res.send(`status : ${err.status}\n message : ${err.message}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
