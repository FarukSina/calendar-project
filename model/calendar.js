const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CalendarSchema = new Schema({
  calendarName: {
    type: String,
    unique: true,
    required: true,
  },
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  roomIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  slotBasedInventoryIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "SlotBasedInventory",
    },
  ],
});

const Calendar = mongoose.model("Calendar", CalendarSchema);

module.exports = Calendar;
