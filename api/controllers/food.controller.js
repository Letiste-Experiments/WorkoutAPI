const db = require("../models")
const Food = db.foods
const sequelize = require("sequelize")


exports.findAll = async (req, res) => {
  let search = "", pageSize = null, pageNumber = 0
  if (req.query) {
    search = req.query.search || "",
      pageSize = req.query.pageSize || null,
      pageNumber = req.query.pageNumber * pageSize || 0
  }
  try {
    const {count, rows} = await Food.findAndCountAll({
      limit: pageSize,
      offset: pageNumber,
      where: {
        name: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          'LIKE', search.toLowerCase() + '%')
      }
    })
    const lastPage = pageSize ? Math.floor(count / pageSize) : 0
    res.send({data: [...rows], lastPage: lastPage})
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}

exports.findOne = async (req, res) => {
  try {
    const data = await Food.findByPk(req.params.id)
    res.send(data)
  } catch (err) {
    res.status(500).send({message: err.message})
  }
}
