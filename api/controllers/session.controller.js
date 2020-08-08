const argon2 = require("phc-argon2")
const db = require("../models")
const User = db.users
const {v4: genuuid} = require('uuid')

const ONE_YEAR_IN_SECONDS = 31556952

exports.create = (req, res) => {
  const email = req.body.email
  const password = req.body.password
  User.findOne({where: {email: email}})
    .then(async user => {
      const match = await argon2.verify(user.password_digest, password)

      if (match) {
        req.session.userid = user.id

        if (req.body.rememberMe) {
          remember_token = genuuid()
          user.remember_digest = await argon2.hash(remember_token)
          await user.save()
          req.session.remember_token = remember_token
          req.session.cookie.maxAge = ONE_YEAR_IN_SECONDS
        }
        req.session.views = 1
        res.send({message: user.id})
      } else {
        res.status(500).send({message: "Invalid email and/or password"})
      }
    })
    .catch(() => {
      res.status(500).send({message: "Invalid email and/or password"})

    })


}

exports.get = async (req, res) => {


  if (!req.session) {
    res.status(500).send({message: "No session found"})
  } else {
    let response = -1
    if (req.session.userid) {
      const userid = req.session.userid
      const user = await User.findByPk(userid)
      const remember_digest = user.remember_digest

      if (req.session.remember_token) {
        const result = await argon2.verify(remember_digest, req.session.remember_token)

        if (result) {
          req.session.views++
          response = userid
        }
      } else {
        req.session.views++
        response = userid
      }
    }
    res.send({userid: response})
  }
}

exports.delete = (req, res) => {
  if (!req.session) {
    res.status(500).send({message: "No session to delete"})
  } else {
    req.session.userid = null
    req.session.remember_token = null
    res.send({message: "Session was deleted successfully"})
  }
}
