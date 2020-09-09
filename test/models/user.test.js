const assert = require("assert")
const db = require("../../api/models")
const argon2 = require("phc-argon2")
const User = db.users

describe('User model', function () {

  let user

  beforeEach(function () {
    user = User.build({
      firstname: "Foo",
      lastname: "Bar",
      email: "foo@bar.com",
      password: "foobar",
      password_confirmation: "foobar",
      age: 20,
      gender: "M",
    })
  })

  afterEach(function () {
    User.findOne({where: {email: user.email}})
      .then(res => {
        if (res) {
          res.destroy()
        }
      })
      .catch(err => {
        console.log("ERROR", err)
      })
  })

  it('should be valid', async function () {

    let validUser = await user.validate()
    assert.equal(validUser, user);
  })

  describe('First name :', function () {

    it("can't be blank", async function () {
      user.firstname = "     "
      await assert.rejects(async (err) => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "notEmpty");
        return true
      }, `${user.firstname}`)
    })
  })

  describe('Last name :', function () {

    it("can't be blank", async function () {
      user.lastname = "    "
      await assert.rejects(async (err) => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "notEmpty");
        return true
      }, `${user.lastname}`)
    })
  })

  describe("Email: ", function () {

    it("should be unique", async function () {
      let userDup = User.build({
        firstname: "Foo",
        lastname: "Bar",
        email: "foo@bar.com",
        password: "foobar",
        password_confirmation: "foobar",
        age: 20,
        gender: "M",
      })
      await user.save()
      await assert.rejects(async (err) => {
        await userDup.save()
      }, (err) => {
        assert.strictEqual(err.parent.constraint, 'Users_email_key')
        return true
      }, "Should be unique")
    })

    it("should reject invalid emails", async function () {

      let invalidEmails = ["user@example,com", "user_at_foo.org", "user.name@example.",
        "foo@bar_baz.com", "foo@bar+baz.com", "foo@bar..com", "   "]

      for (email of invalidEmails) {
        user.email = email
        await assert.rejects(async () => {
          await user.validate()
        }, (err) => {
          assert.strictEqual(err.errors[0].validatorKey, "isEmail");
          return true
        }, `Email should not be valid ${email}`)
      }
    })

    it("should accept valid emails", async function () {

      let validEmails = ["users@example.com", "USER@foo.CoM", "alice+bob@baz.cn",
        "A_US_ER@foo.bar.org", "first.last@foo.jp"]

      for (email of validEmails) {
        user.email = email
        let validUser = await user.validate()
        assert.strictEqual(validUser, user);
      }
    })
  })

  describe('Password :', function () {


    it("can't be null", async function () {
      user.password = user.password_confirmation = null
      await assert.rejects(async () => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "is_null")
        return true
      })
    })

    it('should be virtual', async function () {
      await user.save()
      let res = await User.findOne({where: {email: user.email}})
      assert.strictEqual(res.dataValues.password, undefined, "Password not null");
    })

    it("can't be blank", async function () {
      user.password = user.password_confirmation = "        "
      await assert.rejects(async (err) => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "notEmpty");
        return true
      }, `${user.email}`)
    })

    it('should have a minimum length', async function () {
      user.password = user.password_confirmation = "a".repeat(5)
      await assert.rejects(async () => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "len")
        return true
      })
    })
  })

  describe('Password_confirmation :', function () {

    it('should be equal to password', async function () {
      await user.set('password_digest', "loutre")
      user.password_confirmation = user.password + "a"
      await assert.rejects(async () => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.message, "Password confirmation is not equal to password")
        return true
      })
    })

    it('should be virtual', async function () {
      await user.save()
      let res = await User.findOne({where: {email: user.email}})
      assert.strictEqual(res.dataValues.password_confirmation, undefined, "Password not null");
    })
  })

  describe('Password_digest :', function () {

    it("can't be blank", async function () {
      await user.save()
      user.password_digest = "         "
      await assert.rejects(async (err) => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "notEmpty");
        return true
      })
    })

    it('should be equal to hashed password', async function () {
      await user.validate()
      let hash = user.password_digest
      let res = await argon2.verify(hash, user.password)
      assert.strictEqual(res, true)
    })

    it("should hash password if exists", function (done) {

      user.save()
        .then(() => {
          User.findOne({where: {email: user.email}})
            .then(res => {
              res.save()
                .then(() => done())
                .catch(err => done(err))
            })
        })

    })

  })


  describe('Age :', function () {

    it("should be an integer", async function () {
      user.age = "a"
      await assert.rejects(async (err) => {
        await user.save()
      }, (err) => {
        assert.strictEqual(err.parent.code, "22P02"); // code invalid text representation
        return true
      })
    })

    it("should have a minimum value", async function () {
      user.age = -1
      await assert.rejects(async (err) => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "min");
        return true
      })
    })
  })

  describe('Gender :', function () {

    it('can only be "M" or "F"', async function () {
      user.gender = "h"
      await assert.rejects(async () => {
        await user.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "isIn")
        return true
      })

      let validGender = ["M", "F"]

      for (gender of validGender) {
        user.gender = gender
        let validUser = await user.validate()
        assert.strictEqual(validUser, user);
      }

    })

  })
})
