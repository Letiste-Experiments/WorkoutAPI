const assert = require("assert")
const app = require('../../config.server')
require("../../api/routes/user.routes")(app)
const request = require("supertest")
const db = require("../../api/models")
const User = db.users


describe("Users routes :", function () {

  const user = {
    firstname: "user",
    lastname: "user",
    email: "user@example.com",
    password: "password",
    password_confirmation: "password",
    gender: "F"
  }

  afterEach(function () {
    User.findOne({where: {email: user.email}})
      .then(res => {
        if (res) {
          res.destroy()
        }
      })
      .catch(err => {
        console.log("ERROR", err)
      })

  })
  

  it("GET /workoutapi/users", function (done) {

    request(app)
      .get("/workoutapi/users")
      .expect(200)
      .then(() => done())
      .catch(done)
  })

  it("POST /workoutapi/users", function (done) {
    request(app)
      .post('/workoutapi/users')
      .send(user)
      .expect(201)
      .then(() => done())
      .catch(done)
  })

})