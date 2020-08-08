const argon2 = require("phc-argon2")
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {

    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },

    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },

    password: {
      type: Sequelize.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, Infinity]
      }
    },

    password_confirmation: {
      type: Sequelize.VIRTUAL,
    },

    password_digest: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true,
      }
    },

    age: {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      }
    },

    gender: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIn: [['M', 'F']]
      }
    },

    remember_digest: {
      type: Sequelize.STRING,
    }
  }, {
    hooks: {
      beforeValidate: async function (user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase()
        }
        if (user.password != user.password_confirmation) {
          throw new Error("Password confirmation is not equal to password")
        }
      },
      afterValidate: async function (user, options) {
        await hasSecurePassword(user)
      }
    }
  })

  let hasSecurePassword = async function (user) {
    if (user.password) {
      const hash = await argon2.hash(user.password)
      return user.set('password_digest', hash)
    } else {
      return true
    }
  }

  return User
}
