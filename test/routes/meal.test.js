const app = require('../../config.server')
require("../../api/routes/meal.routes")(app)
const request = require("supertest")
const session = require("supertest-session")
const db = require("../../api/models")
const User = db.users
const Meal = db.meals

let testSession = null
beforeEach(function () {
  testSession = session(app)
})

describe("Meal routes :", function () {

  let authenticatedSession
  const user = {
    firstname: "user",
    lastname: "user",
    email: "user@example.com",
    password: "password",
    password_confirmation: "password",
    gender: "F"
  }

  beforeEach(function (done) {
    User.create(user)
      .then(() => {

        testSession.post("/workoutapi/sessions")
          .send(user)
          .expect(200)
          .end(function (err) {
            if (err) return done(err);
            authenticatedSession = testSession
            return done()
          })
      })
  })

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

  it("POST /workoutapi/meals", function (done) {
    const meal = {
      name: "Meal",
      foods: [{id: 5000, quantity: 200, unit: "g"}]
    }
    authenticatedSession.post("/workoutapi/meals")
      .send(meal)
      .expect(200)
      .then(() => done())
      .catch(done)
  })

  it("GET /workoutapi/meals/:id", function (done) {
    Meal.create({name: "Meal"})
      .then((meal) => {
        authenticatedSession.get(`/workoutapi/meals/${meal.id}`)
          .expect(200)
          .then(() => {
            Meal.destroy({where: {id: meal.id}})
            done()
          })
          .catch(done)
      })
  })

  it("DELETE /workoutapi/meals/:id", function (done) {
    Meal.create({name: "Meal"})
      .then((meal) => {
        authenticatedSession.delete(`/workoutapi/meals/${meal.id}`)
          .expect(200)
          .then(() => {
            done()
          })
          .catch(done)
      })
  })
})