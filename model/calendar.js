const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CalendarSchema = new Schema({
  calendarName: {
    type: String,
    unique: true,
    required: true,
  },
  hotelId: {
    type: Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  roomIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
});

const Calendar = mongoose.model("Calendar", CalendarSchema);

module.exports = Calendar;
