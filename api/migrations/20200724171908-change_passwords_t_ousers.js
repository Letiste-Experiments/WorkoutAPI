'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'users',
      'password_confirmation'
    )
    await queryInterface.removeColumn(
      'users',
      'password'
    )
    await queryInterface.changeColumn(
      'users',
      'password_digest',
      {
        type: Sequelize.STRING,
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'users',
      'password_confirmation',
      {
        type: Sequelize.STRING
      }
    )
    await queryInterface.addColumn(
      'users',
      'password',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    )
    await queryInterface.addColumn(
      'users',
      'password_digest',
      {
        type: Sequelize.STRING,
      }
    )
  }
};
