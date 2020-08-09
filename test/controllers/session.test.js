const app = require('../../config.server')
require("../../api/routes/meal.routes")(app)
const assert = require("assert")
const sinon = require("sinon")
const sinonTest = require("sinon-test")
const argon2 = require("phc-argon2")
const test = sinonTest(sinon)
const db = require("../../api/models")
const User = db.users
const ControllerSession = require("../../api/controllers/session.controller")

describe("Sessions controllers :", function () {
  let req,
    error = new Error({error: "I'm an error"}),
    res = {},
    expectedResult
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

    it("should create a temporary session and send the user id", test(async function () {
      const user = await User.create(userData)
      req = {body: {email: user.email, password: user.password}, session: {}}
      expectedResult = {userid: user.id}
      await ControllerSession.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.send, expectedResult)
      assert.strictEqual(req.session.userid, user.id)
      assert.strictEqual(req.session.views, 1)
      assert.strictEqual(req.session.remember_token, undefined)
    }))

    it("should create a cookie session and send the user id", test(async function () {
      const user = await User.create(userData)
      req = {
        body: {email: user.email, password: user.password, rememberMe: true},
        session: {cookie: {}}
      }
      expectedResult = {userid: user.id}
      await ControllerSession.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.send, expectedResult)
      assert.strictEqual(req.session.userid, user.id)
      assert.strictEqual(req.session.views, 1)
      assert(req.session.remember_token)
      assert(req.session.cookie.maxAge)
    }))

    it("should send status 500 and message error if invalid password", test(async function () {
      const user = await User.create(userData)
      req = {
        body: {email: user.email, password: "", rememberMe: true},
        session: {cookie: {}}
      }
      expectedResult = {message: "Invalid email and/or password"}
      await ControllerSession.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))

    it("should send status 500 and message error if invalid email", test(async function () {
      const user = await User.create(userData)
      req = {
        session: {cookie: {}}
      }
      expectedResult = {message: "Invalid email and/or password"}
      await ControllerSession.create(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  })

  describe("get :", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should send userid and increment session views when it's session", test(async function () {
      const user = await User.create(userData)
      req = {
        session: {userid: user.id, views: 5}
      }
      expectedResult = {userid: user.id}
      await ControllerSession.get(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.send, expectedResult)
      assert.strictEqual(req.session.views, 6)
    }))

    it("should authenticate user when it's cookie session and send userid and increment session views", test(async function () {
      const user = await User.create(userData)
      req = {
        session: {userid: user.id, views: 5, remember_token: "token"}
      }
      expectedResult = {userid: user.id}
      this.stub(argon2, 'verify').resolves(true)
      await ControllerSession.get(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.send, expectedResult)
      assert.strictEqual(req.session.views, 6)
    }))

    it("should send -1 if no userid", test(async function () {
      req = {session: {}}
      expectedResult = {userid: -1}
      await ControllerSession.get(req, res)

      sinon.assert.calledWith(res.send, expectedResult)
      assert.strictEqual(req.session.views, undefined)
    }))

    it("should send -1 if wrong remember_token", test(async function () {
      const user = await User.create(userData)
      req = {
        session: {userid: user.id, views: 5, remember_token: "token"}
      }
      expectedResult = {userid: -1}
      this.stub(argon2, 'verify').resolves(false)
      await ControllerSession.get(req, res)
      await User.destroy({where: {id: user.id}})

      sinon.assert.calledWith(res.send, expectedResult)
      assert.strictEqual(req.session.views, 5)
    }))

    it("should send status 500 and error message when no session", test(async function () {
      req = {}
      expectedResult = {message: "No session found"}
      await ControllerSession.get(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledWith(res.status(500).send, expectedResult)
    }))
  })

  describe("delete :", function () {

    beforeEach(function () {
      res = {
        send: sinon.spy(),
        status: sinon.stub().returns({send: sinon.spy()})
      }
    })

    it("should nullify userid, remember_token, cookie.maxAge of the session and send a message", test(async function () {
      req = {session: {userid: 1, remember_token: "token", cookie: {maxAge: 10}}}
      await ControllerSession.delete(req, res)

      sinon.assert.calledOnce(res.send)
      assert.strictEqual(req.session.userid, null)
      assert.strictEqual(req.session.remember_token, null)
      assert.strictEqual(req.session.cookie.maxAge, null)
    }))

    it("should send status 500 and error message when no session", test(async function () {
      req = {}
      await ControllerSession.delete(req, res)

      sinon.assert.calledWith(res.status, 500)
      sinon.assert.calledOnce(res.status(500).send)
    }))
  })
})