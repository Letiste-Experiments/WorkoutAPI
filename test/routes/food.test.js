const app = require('../../config.server')
require("../../api/routes/meal.routes")(app)
const request = require("supertest")

describe("Food routes :", function () {

  it("GET /workoutapi/foods", function (done) {
    request(app)
      .get("/workoutapi/foods")
      .expect(200)
      .then(() => done())
      .catch(done)
  })

  it("GET /workoutapi/foods/:id", function (done) {
    request(app)
      .get("/workoutapi/foods/4000")
      .expect(200)
      .then(() => done())
      .catch(done)
  })
})