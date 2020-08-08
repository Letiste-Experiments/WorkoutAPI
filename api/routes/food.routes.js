module.exports = app => {
  const foods = require("../controllers/food.controller.js")

  let router = require("express").Router()
  
  router.get("/", foods.findAll)

  router.get("/:id", foods.findOne)

  app.use("/workoutapi/foods", router)
}

