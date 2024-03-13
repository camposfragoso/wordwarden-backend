require("dotenv").config() 
require("./models/connection") 

var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
require('./models/connection');

var indexRouter = require("./routes/index")
var usersRouter = require("./routes/users") 
var filesRouter = require("./routes/files")
var llmRouter = require("./routes/llm")
var foldersRouter = require("./routes/folders")

var app = express()

const cors = require("cors") 

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4000",
      "http://localhost:4001",
      "https://wordwarden-frontend-fawn.vercel.app"
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions)) 

app.use(logger("dev"))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))



app.use("/", indexRouter)
app.use("/users", usersRouter) 
app.use("/llm", llmRouter)
app.use("/files", filesRouter)
app.use("/folders", foldersRouter)

module.exports = app