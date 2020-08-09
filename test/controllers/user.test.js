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

  describe("addFood :", function () {
    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should add a food to the user and send a message", test(async function () {
      const user = await User.create(userData)
      const userid = user.id
      const countFoods = await user.countFood()
      const foodid = 5000
      const food = await Food.findByPk(foodid)
      req = {session: {userid: userid}, body: {foodid: foodid}}
      sinon.spy(user, 'addFood')
      this.stub(User, 'findByPk').resolves(user)
      await ControllerUser.addFood(req, res)
      const nextCountFoods = await user.countFood()
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(user.addFood, food)
      sinon.assert.calledOnce(res.send)
      assert.strictEqual(countFoods + 1, nextCountFoods)
    }))

    it("should send status 500 and error message if no userid provided", test(async function () {
      req = {session: {}}
      await ControllerUser.addFood(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and error message if userid incorrect", test(async function () {
      req = {session: {userid: -1}, body: {foodid: 5000}}
      await ControllerUser.addFood(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and error message if no foodid provided", test(async function () {
      const user = await User.create(userData)
      const userid = user.id
      req = {session: {userid: userid}}
      await ControllerUser.addFood(req, res)
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)

    }))

    it("should send status 500 and error message if foodid incorrect", test(async function () {
      const user = await User.create(userData)
      const userid = user.id
      expectedResult = {message: "Food not found"}
      req = {session: {userid: userid}, body: {foodid: -1}}
      await ControllerUser.addFood(req, res)
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  })

  describe("findAllFoods :", function () {
    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send paginated filtered foods and last page of a user", test(async function () {
      const user = await User.create(userData)
      const userid = user.id
      await user.addFood([5000, 7845, 6523])

      const search = "e"
      const pageSize = 10
      const pageNumber = 0
      req = {
        session: {userid: userid},
        query: {search: search, pageNumber: pageNumber, pageSize: pageSize}
      }
      const foods = await user.getFood({
        limit: pageSize,
        offset: pageNumber,
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })
      const count = await user.countFood({
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', search.toLowerCase() + '%')
        }
      })
      const lastPage = Math.floor(count / pageSize)
      expectedResult = {foods: [...foods], lastPage: lastPage}
      await ControllerUser.findAllFoods(req, res)
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send all foods and last page of a user when no query", test(async function () {
      const user = await User.create(userData)
      await user.addFood([5000, 7845, 6523])
      const userid = user.id
      req = {
        session: {userid: userid},

      }
      const foods = await user.getFood({
        limit: null,
        offset: 0,
        where: {
          name: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            'LIKE', "".toLowerCase() + '%')
        }
      })

      const lastPage = 0
      expectedResult = {foods: [...foods], lastPage: lastPage}
      await ControllerUser.findAllFoods(req, res)
      await User.destroy({where: {id: userid}})

      sinon.assert.calledWith(res.send, expectedResult)
    }))
    

    it("should send status 500 and error message if no userid provided", test(async function () {
      req = {session: {}}
      await ControllerUser.findAllFoods(req, res)
      expectedResult = {message: "No user logged in"}

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))

    it("should send status 500 and error message if userid incorrect", test(async function () {
      req = {session: {userid: -1}, query: {}}
      await ControllerUser.findAllFoods(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send)
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