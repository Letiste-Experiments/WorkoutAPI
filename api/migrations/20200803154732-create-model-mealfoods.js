'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MealFoods', {

      quantity: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MealFoods')
  }
};
