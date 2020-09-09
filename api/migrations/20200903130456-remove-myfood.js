'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserFoods')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserFoods", {})
  }
};
