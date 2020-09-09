const app = require('../../config.server')
require("../../api/routes/meal.routes")(app)
const assert = require("assert")
const sinon = require("sinon")
const sinonTest = require("sinon-test")
const test = sinonTest(sinon)
const db = require("../../api/models")
const User = db.users
const Meal = db.meals
const Food = db.foods
const ControllerMeal = require("../../api/controllers/meal.controller")

describe("Meals controllers :", function () {
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

    it("should create a Meal associated to foods and a user", test(async function () {
      const user = await User.create(userData)
      req = {
        body: {name: "Meal", foods: [{id: 4561, quantity: 200, unit: "g"}, {id: 5671, quantity: 150, unit: "g"}]},
        session: {userid: user.id}
      }
      await ControllerMeal.create(req, res)
      const countMeal = await user.countMeals()
      const meal = (await user.getMeals())[0]
      const foods = await meal.getFood()
      const countFoods = foods.length
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledOnce(res.send)
      foods.forEach((food, index) => {
        const values = food.dataValues.MealFoods.dataValues
        const expectedValues = req.body.foods[index]
        assert.strictEqual(values.quantity, expectedValues.quantity);
        assert.strictEqual(values.unit, expectedValues.unit)
      })
      assert.strictEqual(countMeal, 1)
      assert.strictEqual(countFoods, 2)
    }))

    it("should send status 500 and an error message when no userid", test(async function () {
      req = {
        body: {name: "Meal", foods: [{id: 4561, quantity: 200, unit: "g"}, {id: 5671, quantity: 150, unit: "g"}]},
      }
      await ControllerMeal.create(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and an error message when incorrect userid", test(async function () {
      req = {
        body: {foods: [{id: 4561, quantity: 200, unit: "g"}, {id: 5671, quantity: 150, unit: "g"}]},
        session: {userid: -1}
      }
      await ControllerMeal.create(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and an error message when no meal", test(async function () {
      const user = await User.create(userData)
      req = {
        body: {foods: [{id: 4561, quantity: 200, unit: "g"}, {id: 5671, quantity: 150, unit: "g"}]},
        session: {userid: user.id}
      }
      await ControllerMeal.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and an error message when incorrect foods", test(async function () {
      const user = await User.create(userData)
      req = {
        body: {foods: [{id: 4561, quantity: 200, unit: "g"}, {id: -1, quantity: 150, unit: "g"}]},
        session: {userid: user.id}
      }
      await ControllerMeal.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and an error message when no foods", test(async function () {
      const user = await User.create(userData)
      req = {
        body: {foods: []},
        session: {userid: user.id}
      }
      await ControllerMeal.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))
  })

  describe("findAllFoods :", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send all foods", test(async function () {
      const meal = await Meal.create({name: "meal"})
      const food = await Food.findByPk(4561)
      await meal.addFood(food, {through: {quantity: 120, unit: "g"}})
      req = {params: {id: meal.id}}
      expectedResult = await meal.getFood()
      await ControllerMeal.findAllFoods(req, res)
      await Meal.destroy({where: {id: meal.id}})

      sinon.assert.calledWith(res.send, expectedResult)
    }))

    it("should send status 500 and error message when no meal id", test(async function () {
      req = {params: {}}
      await ControllerMeal.findAllFoods(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and error message when incorrect meal id", test(async function () {
      req = {params: {id: -1}}
      await ControllerMeal.findAllFoods(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))
  })

  describe("delete: ", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should delete the meal and send a message", test(async function () {
      const meal = await Meal.create({name: "meal"})
      req = {params: {id: meal.id}}
      const count = await Meal.count()
      expectedResult = count - 1
      await ControllerMeal.delete(req, res)

      const newCount = await Meal.count()
      assert.strictEqual(newCount, expectedResult)
      sinon.assert.calledOnce(res.send)
    }))

    it("should send status 500 and error message when no id", test(async function () {
      req = {params: {}}
      await ControllerMeal.delete(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))

    it("should send status 500 and error message when incorrect id", test(async function () {
      req = {params: {id: -1}}
      await ControllerMeal.delete(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))
  })
})


