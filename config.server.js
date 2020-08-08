const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const session = require("express-session")
const {v4: genuuid} = require('uuid')

const app = express()


const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://192.168.1.43:3000',
  ],
  credentials: true,
}

app.use(session({
  genid: function (req) {
    return genuuid() // use UUIDs for session IDs
  },
  secret: 'keyboard cat', cookie: {maxAge: null, httpOnly: false}
}))
app.use(cors(corsOptions))


app.use(function (req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// parse requests of content-type - application/json
app.use(bodyParser.json())

// parse request of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

const db = require("./api/models")


console.log("Connecting to db...")
db.sequelize.authenticate().then(() => {
  console.log("Success!");
}).catch((err) => {
  console.log(err);
});

db.sequelize.sync();


// simple route
app.get("/", (req, res) => {
  res.json({message: "Welcome to workoutAPI"})
})

require("./api/routes/user.routes")(app)
require("./api/routes/session.routes")(app)
require("./api/routes/food.routes")(app)
require("./api/routes/meal.routes")(app)

module.exports = app