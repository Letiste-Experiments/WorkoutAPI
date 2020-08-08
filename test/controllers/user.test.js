const assert = require("assert")
const db = require("../../api/models")
const argon2 = require("phc-argon2")
const User = db.users
const users = require('../../api/controllers/user.controller')


describe('Users controllers :', function () {

  let user

  beforeEach(function () {
    user = User.build({
      firstname: "Foo",
      lastname: "Bar",
      email: "foo@bar.com",
      password: "foobar",
      password_confirmation: "foobar",
      age: 20,
      gender: "M",
    })
  })

  afterEach(function () {
    User.findOne({ where: { email: user.email } })
      .then(res => {
        if (res) {
          res.destroy()
        }
      })
      .catch(err => {
        console.log("ERROR", err)
      })
  })


})