const db = require("../models")
const User = db.users
const Food = db.foods
const sequelize = require("sequelize")


// Create and save a new User
exports.create = async (req, res) => {
  try {
    const body = req.body || {}
    const user = {
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      password: body.password,
      password_confirmation: body.password_confirmation,
      password_digest: body.password_digest,
      age: body.age,
      gender: body.gender,
    }


    const data = await User.create(user)
    res.status(201).send(data)

  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

// Retrieve all Users from the database 
exports.findAll = async (req, res) => {
  try {
    const data = await User.findAll()
    res.send(data)
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

// Find a User by id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id
    const data = await User.findByPk(id)
    res.send(data)
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

// Update a User by the id in the request
exports.update = (req, res) => {

}

// Add a Food to a User
exports.addFood = async (req, res) => {
  if (req.session.userid) {
    const userid = req.session.userid
    try {
      const user = await User.findByPk(userid)
      const food = await Food.findByPk(req.body.foodid)
      if (food) {
        await user.addFood(food)
        res.send({message: "Food was successfully added to User"})
      } else {
        throw new Error("Food not found")
      }
    } catch (err) {
      res.status(500).send({message: err.message})
    }
  } else {
    res.status(500).send({message: "No user logged in"})
  }

}


// Get all Meals of a User
exports.findAllMeals = async (req, res) => {
  let search = "", pageSize = null, pageNumber = 0
  if (req.query) {
    search = req.query.search || "",
      pageSize = req.query.pageSize || null,
      pageNumber = req.query.pageNumber * pageSize || 0
  }
  if (req.session.userid) {
    const userid = req.session.userid
    try {
      const user = await User.findByPk(userid)
      const num = await user.countMeals({
        limit: pageSize,
        offset: pageNumber,
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })
      const meals = await user.getMeals({
        limit: pageSize,
        offset: pageNumber,
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })
      const lastPage = pageSize ? Math.floor(num / pageSize) : 0
      res.send({meals: [...meals], lastPage: lastPage})
    } catch (err) {
      res.status(500).send({message: err.message})
    }
  } else {
    res.status(500).send({message: "No user logged in"})
  }
}
