module.exports = app => {
  const meals = require("../controllers/meal.controller")

  let router = require("express").Router()

  // Create a new Meal
  router.post("/", meals.create)

  // Get all Foods of a Meal
  router.get("/:id", meals.findAllFoods)

  // Delete a Meal
  router.delete("/:id", meals.delete)
  
  app.use("/workoutapi/meals", router)
}