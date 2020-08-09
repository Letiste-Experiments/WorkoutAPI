const db = require("../models")
const Meal = db.meals
const Food = db.foods
const User = db.users

// Create and save a new Meal
exports.create = async (req, res) => {
  try {
    const newMeal = {name: req.body.name}
    const user = await User.findByPk(req.session.userid)
    const meal = await Meal.create(newMeal)
    let food
    req.body.foods.forEach(async ({id, quantity, unit}) => {
      food = await Food.findByPk(id)
      meal.addFood(food, {through: {quantity: quantity, unit: unit}})
    })
    await user.addMeal(meal)
    res.send({message: "Meal created"})
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

// Find all the Foods of a Meal
exports.findAllFoods = async (req, res) => {
  try {
    const id = req.params.id
    const meal = await Meal.findByPk(id)
    const foods = await meal.getFood()
    res.send(foods)
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

// Delete a Meal
exports.delete = async (req, res) => {
  try {
    const id = req.params.id
    const num = await Meal.destroy({where: {id: id}})
    if (num === 0) {
      throw new Error("Meal doesn't exist")
    }
    res.send({message: "Meal deleted"})
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

