module.exports = app => {
  const sessions = require("../controllers/session.controller")

  let router = require("express").Router()

  // Create a new session
  router.post("/", sessions.create)

  // Get the current userid
  router.get("/", sessions.get)

  // Delete the current userid
  router.delete("/", sessions.delete)

  app.use('/workoutapi/sessions', router)
}
