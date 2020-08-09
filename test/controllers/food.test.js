const app = require('../../config.server')
require("../../api/routes/meal.routes")(app)
const sequelize = require("sequelize")
const sinon = require("sinon")
const sinonTest = require("sinon-test")
const test = sinonTest(sinon)
const db = require("../../api/models")
const Food = db.foods
const ControllerFood = require("../../api/controllers/food.controller")

describe("Foods controllers :", function () {

  let req,
    error = new Error({error: "I'm an error"}),
    res = {},
    expectedResult

  describe("findAll :", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send paginated filtered foods and last page", test(async function () {

      const search = "e"
      const pageSize = 10
      const pageNumber = 0
      req = {query: {search: search, pageSize: pageSize, pageNumber: pageNumber}}
      const {count, rows} = await Food.findAndCountAll({
        limit: pageSize,
        offset: pageNumber,
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })

      const lastPage = Math.floor(count / pageSize)
      expectedResult = {data: [...rows], lastPage: lastPage}
      await ControllerFood.findAll(req, res)
      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send status 500 and error message on server error", test(async function () {
      this.stub(Food, 'findAndCountAll').throws(error)
      req = {}
      expectedResult = {message: error.message}
      await ControllerFood.findAll(req, res)
      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))

  })

  describe("findOne :", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send the food found by id", test(async function () {
      const id = 5000
      req = {params: {id: id}}
      expectedResult = await Food.findByPk(id)
      await ControllerFood.findOne(req, res)
      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should return status 500 and error message on server error", test(async function () {
      this.stub(Food, 'findByPk').throws(error)
      expectedResult = {message: error.message}
      await ControllerFood.findOne(req, res)
      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  })
})