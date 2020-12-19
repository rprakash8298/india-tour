const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req,res,next) => {
      try {
          const token = req.cookies.jwt
          const verifyUser = jwt.verify(token, `${process.env.JWT_KEY}`)
          const user = await User.findOne({ _id: verifyUser._id})
          req.user = user
          next()
      } catch (e) {
        //   res.status(401).send({error:'session expired, please login again! '})
          res.redirect('/users/landingPage')
      }
}
 
module.exports = auth