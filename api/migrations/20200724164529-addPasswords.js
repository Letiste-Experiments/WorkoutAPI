'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users',
    'password_confirmation',
     {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('Users',
    'password_digest',
     {
      type: Sequelize.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'password_confirmation')
    await queryInterface.removeColumn('Users', 'password_digest')

  }
};
