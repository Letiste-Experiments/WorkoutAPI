module.exports = (sequelize, Sequelize) => {
  const Food = sequelize.define("food", {

    name: {
      type: Sequelize.STRING,
    },

    energy: {
      type: Sequelize.INTEGER
    },

    protein: {
      type: Sequelize.FLOAT
    },

    carbohydrates: {
      type: Sequelize.FLOAT
    },

    carbohydrates_sugar: {
      type: Sequelize.FLOAT
    },

    fat: {
      type: Sequelize.FLOAT
    },

    fat_saturated: {
      type: Sequelize.FLOAT
    },

    fibres: {
      type: Sequelize.FLOAT
    },

    sodium: {
      type: Sequelize.FLOAT
    }
  })

  return Food
}