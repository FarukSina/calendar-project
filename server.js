var express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cron = require("node-cron");
var app = express();
// const roombookingRouter = require("./routes/roombookingRouter");
const roomRouter = require("./routes/roomRouter");
const userRouter = require("./routes/userRouter");
const calendarRouter = require("./routes/calendarRouter");
const eventRouter = require("./routes/bookingEventRouter");
const merchantRouter = require("./routes/merchantRouter");
const slotRouter = require("./routes/slotBasedInventoryRouter");
const slotEventRouter = require("./routes/slotEventRouter");
const port = process.env.PORT || 3000;
const BookingEvent = require("./model/bookingEvent");
// Implement Body Parser
const bodyParser = require("body-parser");
const {
  deleteBookingEventByCronJob,
} = require("./controllers/bookingEventController");
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

// Cron Job

cron.schedule("* * * * *", async () => {
  let deleteResponse = null;
  const currentTime = Date.now();
  const findAllBookingEvents = async () => {
    try {
      let bookingEvents = await BookingEvent.find({
        isBooked: false,
      });
      return bookingEvents;
    } catch (error) {
      console.log(error.stack);
    }
  };
  const result = await findAllBookingEvents();
  const filteredResultByDate = result.filter((bookingEvent) => {
    if (currentTime - bookingEvent.updatedAt >= 900000) {
      return bookingEvent;
    } else {
      return null;
    }
  });
  if (filteredResultByDate && filteredResultByDate.length > 0) {
    filteredResultByDate.map(async (bookingEvent) => {
      const { _id, roomId } = bookingEvent;
      deleteResponse = await deleteBookingEventByCronJob(_id, roomId);
    });
  }
  console.log("running a task every minute", deleteResponse);
});

// Endpoints

app.use("/api/calendar", calendarRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use("/api/bookingEvent", eventRouter);
app.use("/api/merchant", merchantRouter);
app.use("/api/slot", slotRouter);
app.use("/api/slotEvent", slotEventRouter);

// app.use("/api/roombooking", roombookingRouter);

app.listen(port, () =>
  console.log(`Node server listening at http://localhost:${port}`)
);
