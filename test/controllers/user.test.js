const app = require('../../config.server')
require("../../api/routes/meal.routes")(app)
const sequelize = require("sequelize")
const assert = require("assert")
const sinon = require("sinon")
const sinonTest = require("sinon-test")
const test = sinonTest(sinon)
const db = require("../../api/models")
const User = db.users
const Food = db.foods
const ControllerUser = require("../../api/controllers/user.controller")


describe('Users controllers :', function () {
  let req,
    error = new Error({error: "I'm an error"}),
    res = {},
    expectedResult,
    userData = {
      firstname: "Foo",
      lastname: "Bar",
      email: "foo@bar.com",
      password: "foobar",
      password_confirmation: "foobar",
      age: 20,
      gender: "M",
    }


  describe("create :", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send created User with status 201", test(async function () {
      req = {body: userData}
      expectedResult = userData
      this.stub(User, 'create').resolves(userData)
      await ControllerUser.create(req, res)
      sinon.assert.calledWith(res.status, 201)
      sinon.assert.calledWith(res.status(201).send, expectedResult)
    }))

    it("should send status 500 and error message on server error", test(async function () {
      this.stub(User, 'create').throws(error)
      req = {}
      expectedResult = {message: error.message}
      await ControllerUser.create(req, res)
      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  })

  describe("findAll :", test(async function () {
    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send all the users", test(async function () {
      expectedResult = await User.findAll()
      await ControllerUser.findAll(req, res)
      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send status 500 and error message on server error", test(async function () {
      this.stub(User, 'findAll').throws(error)
      expectedResult = {message: error.message}
      await ControllerUser.findAll(req, res)
      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  }))

  describe("findOne :", function () {
    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send the user found by id", test(async function () {
      const user = await User.create(userData)
      const id = user.id
      req = {params: {id: id}}
      expectedResult = await User.findByPk(id)
      await ControllerUser.findOne(req, res)
      await User.destroy({where: {id: id}})

      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send status 500 and error message on server error", test(async function () {
      this.stub(User, 'findOne').throws(error)
      expectedResult = {message: error.message}
      await ControllerUser.findOne(req, res)
      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  })

  
  describe("findAllMeals :", function () {
    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send paginated filtered meals and last page of a user", test(async function () {
      const user = await User.create(userData)
      const userid = user.id
      const search = "e"
      const pageSize = 10
      const pageNumber = 0
      req = {
        session: {userid: userid},
        query: {search: search, pageNumber: pageNumber, pageSize: pageSize}
      }
      const meals = await user.getMeals({
        limit: pageSize,
        offset: pageNumber,
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })
      const count = await user.countMeals({
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })
      const lastPage = Math.floor(count / pageSize)
      expectedResult = {meals: [...meals], lastPage: lastPage}
      await ControllerUser.findAllMeals(req, res)
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send all meals and last page of a user when no query", test(async function () {
      const user = await User.create(userData)
      const userid = user.id
      req = {
        session: {userid: userid},

      }
      const meals = await user.getMeals({})

      const lastPage = 0
      expectedResult = {meals: [...meals], lastPage: lastPage}
      await ControllerUser.findAllMeals(req, res)
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send status 500 and error message if no userid provided", test(async function () {
      req = {session: {}}
      await ControllerUser.findAllMeals(req, res)
      expectedResult = {message: "No user logged in"}

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))

    it("should send status 500 and error message if userid incorrect", test(async function () {
      req = {session: {userid: -1}, query: {}}
      await ControllerUser.findAllMeals(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send)
    }))
  })

})