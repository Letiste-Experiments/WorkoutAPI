const argon2 = require("phc-argon2")
const db = require("../models")
const User = db.users
const {v4: genuuid} = require('uuid')

const ONE_YEAR_IN_SECONDS = 31556952

exports.create = async (req, res) => {
  let email = "", password = ""
  if (req.body) {
    email = req.body.email
    password = req.body.password
  }
  try {
    const user = await User.findOne({where: {email: email}})
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
      res.send({userid: user.id})
    } else {
      res.status(500).send({message: "Invalid email and/or password"})
    }
  } catch {
    res.status(500).send({message: "Invalid email and/or password"})

  }
}

exports.get = async (req, res) => {
  if (!req.session) {
    res.status(500).send({message: "No session found"})
  } else {
    let response
    if (req.session.userid) {
      const userid = req.session.userid
      const user = await User.findByPk(userid)
      const remember_digest = user.remember_digest

      if (req.session.remember_token) {
        const result = await argon2.verify(remember_digest, req.session.remember_token)
        if (result) {
          req.session.views++
          response = userid
        } else {
          response = -1
        }
      } else {
        req.session.views++
        response = userid
      }
    } else {
      response = -1
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
    req.session.cookie.maxAge = null
    res.send({message: "Session was deleted successfully"})
  }
}
