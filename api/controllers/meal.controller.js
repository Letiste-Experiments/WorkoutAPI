const db = require("../models")
const Meal = db.meals
const Food = db.foods
const User = db.users

// Create and save a new Meal
exports.create = async (req, res) => {
  const newMeal = {name: req.body.name}
  const user = await User.findByPk(req.session.userid)
  Meal.create(newMeal)
    .then(meal => {

      let food
      req.body.foods.forEach(async ({id, quantity, unit}) => {
        food = await Food.findByPk(id)
        meal.addFood(food, {through: {quantity: quantity, unit: unit}})
      })
      user.addMeal(meal)
        .then(() => res.send({message: "Meal created"}))
        .catch((err) => res.status(500).send({message: err.message}))
    })
    .catch(err => res.status(500).send({message: err.message}))
}

// Find all the Foods of a Meal
exports.findAllFoods = (req, res) => {
  const id = req.params.id

  Meal.findByPk(id)
    .then(meal => {
      meal.getFood()
        .then(foods => res.send(foods))
        .catch(err => res.status(500).send({message: err.message}))
    })
    .catch(err => res.status(500).send({message: err.message}))
}

// Delete a Meal
exports.delete = (req, res) => {
  const id = req.params.id

  Meal.destroy({where: {id: id}})
    .then(() => res.send({message: "Meal deleted"}))
    .catch((err) => res.status(500).send({message: err.message}))
}

