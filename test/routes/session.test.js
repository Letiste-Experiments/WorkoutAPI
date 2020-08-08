const assert = require("assert")
const app = require('../../config.server')
require("../../api/routes/session.routes")(app)
const request = require("supertest")
const db = require("../../api/models")
const User = db.users
const sessions = require("../../api/controllers/session.controller")

describe("Sessions routes :", function () {
  const user = {
    firstname: "user",
    lastname: "user",
    email: "user@example.com",
    password: "password",
    password_confirmation: "password",
    gender: "F"
  }

  it("GET /workoutapi/sessions", function (done) {
    request(app)
      .get("/workoutapi/sessions")
      .expect(200)
      .then(() => {
        done()
      })
      .catch(done)
  })

  it("POST /workoutapi/sessions", function (done) {
    User.create(user)
      .then(() => {
        request(app)
          .post("/workoutapi/sessions")
          .send(user)
          .expect(200)
          .then(() => {
            User.destroy({where: {email: user.email}})
            done()
          })
          .catch(done)
      })
  })

  it("DELETE /workoutapi/sessions", function (done) {
    request(app)
      .delete("/workoutapi/sessions")
      .expect(200)
      .then(() => done())
      .catch(done)
  })
})