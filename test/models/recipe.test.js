const assert = require("assert")
const db = require("../../api/models")
const Recipe = db.recipes

describe("Recipe model", function () {

  let recipe

  beforeEach(function () {
    recipe = Recipe.build({
      name: "Recipe"
    })
  })

  afterEach(function () {
    Recipe.findOne({where: {name: recipe.name}})
      .then(res => {
        if (res) res.destroy;
      })
      .catch(err => console.log("ERROR", err))
  })

  it("should be valid", async function () {
    let validRecipe = await recipe.validate()
    assert.strictEqual(validRecipe, recipe)
  })

  describe("Name :", function () {

    it("can't be blank", async function () {
      recipe.name = "      "
      await assert.rejects(async () => {
        await recipe.validate()
      }, (err) => {
        assert.strictEqual(err.errors[0].validatorKey, "notEmpty");
        return true
      })
    })
  })
})
