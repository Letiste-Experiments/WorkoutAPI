module.exports = app => {
  const users = require("../controllers/user.controller.js")

  let router = require("express").Router()

  // Create a new User
  router.post("/", users.create)

  // Get all Users
  router.get("/", users.findAll)

  // Get a User by id
  router.get("/:id", users.findOne)
  

  // Get all Meals of a User
  router.get("/:id/mymeals", users.findAllMeals)

  app.use('/workoutapi/users', router)
}