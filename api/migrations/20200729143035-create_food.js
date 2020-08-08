'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('foods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
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
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }

    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('foods')
  }
};
