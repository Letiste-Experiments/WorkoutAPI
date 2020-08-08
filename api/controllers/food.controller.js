const db = require("../models")
const Food = db.foods
const sequelize = require("sequelize")


exports.findAll = (req, res) => {
  const search = req.query.search || ""
  const pageSize = req.query.pageSize || null
  const pageNumber = req.query.pageNumber * pageSize || 0
  Food.findAndCountAll({
    limit: pageSize,
    offset: pageNumber,
    where: {
      name: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        'LIKE', search.toLowerCase() + '%')
    }
  })
    .then(({count, rows}) => {
      const lastPage = pageSize ? Math.floor(count / pageSize) : 0
      res.send({data: [...rows], lastPage: lastPage})
    })
    .catch(err => {
      res.status(500).send({message: err.message})
    })
}

exports.findOne = (req, res) => {
  Food.findByPk(req.params.id)
    .then(data => {
      res.send(data)
    })
    .catch(console.log)
}
