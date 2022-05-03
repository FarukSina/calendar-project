var express = require("express");
const mongoose = require("mongoose");
const Calendar = require("./model/calendar");
const Room = require("./model/room");
require("dotenv").config();
const cors = require("cors");
var app = express();
// const roombookingRouter = require("./routes/roombookingRouter");
const roomRouter = require("./routes/roomRouter");
const userRouter = require("./routes/userRouter");
const calendarRouter = require("./routes/calendarRouter");
const eventRouter = require("./routes/eventRouter");
const port = process.env.PORT || 3000;
// Implement Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
const { DB_URI, DB_USER, DB_PASS } = process.env;
// Mongo access
const Connect = async () => {
  try {
    let client = await mongoose.connect(DB_URI, {
      authSource: "admin",
      user: DB_USER,
      pass: DB_PASS,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    });
    console.log("Database is connected!", client.connection.db.databaseName);
  } catch (error) {
    console.log(error.stack);
    process.exit(1);
  }
};
Connect();

// Endpoints

app.use("/api/calendar", calendarRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use("/api/event", eventRouter);

// app.use("/api/roombooking", roombookingRouter);

app.listen(port, () =>
  console.log(`Node server listening at http://localhost:${port}`)
);
