const db = require("../models")
const User = db.users
const Food = db.foods
const Op = db.Sequelize.Op
const {Encryption} = require("@adonisjs/encryption/build/standalone")
const encryption = new Encryption({secret: "i2l7hVvohkBGqcct"})
const sequelize = require("sequelize")


// Create and save a new User
exports.create = async (req, res) => {

  const user = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    password_confirmation: req.body.password_confirmation,
    password_digest: req.body.password_digest,
    age: req.body.age,
    gender: req.body.gender,
  }


  User.create(user)
    .then(data => {
      req.session.userid = encryption.encrypt(user.id)
      req.session.view = 1
      res.status(201).send(data)

    })
    .catch(err => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while creating the user."
      })
    })
}

// Retrieve all Users from the database 
exports.findAll = (req, res) => {

  User.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      })
    })

}

// Find a single Tutorial with the id in the request
exports.findOne = (req, res) => {
  const id = req.params.id

  User.findByPk(id)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.status(500).send({
        message: `Error retrieving User with id = ${id}`
      })
    })

}

// Update a User by the id in the request
exports.update = (req, res) => {

}

// Delete the User with the id in the request
exports.delete = (req, res) => {
  const id = req.params.id

  User.destroy({
    where: {id: id}
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully"
        })
      } else {
        res.status(500).send({
          message: `Cannot delete User with id = ${id}`
        })
      }
    })
    .catch(err => {
      res.status(500).send({
        message: `Could not delete User with id = ${id}`
      })
    })

}

// Delete all Users from the database
exports.deleteAll = (req, res) => {

  User.destroy({where: {}, truncate: false})
    .then(nums => {
      res.send({
        message: `${nums} Users were deleted successfully`
      })
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occured while removing all tutorials"
      })
    })
}

// Add a Food to a User
exports.addFood = (req, res) => {
  if (req.session.userid) {
    const userid = req.session.userid

    User.findByPk(userid)
      .then(user => {
        Food.findByPk(req.body.foodid)
          .then(food => {
            user.addFood(food)
              .then(() => res.send({message: "Food was successfully added to User"}))
              .catch(err => res.status(500).send({message: err.message}))
          })
          .catch(err => res.status(500).send({message: err.message}))
      })
  } else {
    res.status(500).send({message: "No user logged in"})
  }

}

// Get all Foods of a User
exports.findAllFoods = (req, res) => {
  const search = req.query.search || ""
  const pageSize = req.query.pageSize || null
  const pageNumber = req.query.pageNumber * pageSize || 0
  if (req.session.userid) {
    const userid = req.session.userid

    User.findByPk(userid)
      .then(user => {
        user.countFood({
          where: {
            name: sequelize.where(
              sequelize.fn('LOWER', sequelize.col('name')),
              'LIKE', search.toLowerCase() + '%')
          }
        })
          .then(num => {
            const lastPage = pageSize ? Math.floor(num / pageSize) : 0
            user.getFood({
              limit: pageSize,
              offset: pageNumber,
              where: {
                name: sequelize.where(
                  sequelize.fn('LOWER', sequelize.col('name')),
                  'LIKE', search.toLowerCase() + '%')
              }
            })
              .then(foods => res.send({foods: [...foods], lastPage: lastPage}))
              .catch(err => res.status(500).send({message: err.message}))
          })
          .catch(err => res.status(500).send({message: err.message}))
      })
      .catch(err => console.log(err))

  } else {
    res.status(500).send({message: "No user logged in"})
  }
}

// Get all Meals of a User
exports.findAllMeals = (req, res) => {
  const search = req.query.search || ""
  const pageSize = req.query.pageSize || null
  const pageNumber = req.query.pageNumber * pageSize || 0
  if (req.session.userid) {
    const userid = req.session.userid

    User.findByPk(userid)
      .then(user => {
        user.countMeals({
          where: {
            name: sequelize.where(
              sequelize.fn('LOWER', sequelize.col('name')),
              'LIKE', search.toLowerCase() + '%')
          }
        })
          .then(num => {
            const lastPage = pageSize ? Math.floor(num / pageSize) : 0
            user.getMeals({
              limit: pageSize,
              offset: pageNumber,
              where: {
                name: sequelize.where(
                  sequelize.fn('LOWER', sequelize.col('name')),
                  'LIKE', search.toLowerCase() + '%')
              }
            })
              .then(meals => res.send({meals: [...meals], lastPage: lastPage}))
              .catch(err => console.log(err))
          })
          .catch(err => res.status(500).send({message: err.message}))
      })
      .catch(err => console.log(err))

  } else {
    res.status(500).send({message: "No user logged in"})
  }
}
