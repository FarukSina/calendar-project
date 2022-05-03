const mongoose = require("mongoose");

const CalendarSchema = new mongoose.Schema({
  calendarName: {
    type: String,
    unique: true,
    required: true,
  },
});

const Calendar = mongoose.model("Calendar", CalendarSchema);

module.exports = Calendar;
