module.exports = (sequelize, Sequelize) => {
  const Meal = sequelize.define("meal", {

    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    }
  })
  return Meal;
};