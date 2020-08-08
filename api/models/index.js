const dbConfig = require("../config/db.config")

const Sequelize = require("sequelize")
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require("./user.model.js")(sequelize, Sequelize)
db.foods = require("./food.model")(sequelize, Sequelize)
db.meals = require("./meal.model")(sequelize, Sequelize)
// Defining the associations
const User = db.users
const Food = db.foods
const Meal = db.meals
// User/Food Many-to-Many
User.belongsToMany(Food, {through: 'UserFoods'})
Food.belongsToMany(User, {through: 'UserFoods'})
// Meal/Food Many-to-Many
const MealFoods = sequelize.define('MealFoods', {
  quantity: Sequelize.FLOAT,
  unit: Sequelize.STRING
}, {timestamps: false})
Meal.belongsToMany(Food, {through: MealFoods})
Food.belongsToMany(Meal, {through: MealFoods})
// User/Meal One-to-Many
User.hasMany(Meal)
Meal.belongsTo(User)

module.exports = db