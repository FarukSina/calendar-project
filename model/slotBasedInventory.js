const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SlotBasedInventorySchema = new Schema({
  slotName: {
    type: String,
    required: true,
  },
  slotNumber: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  calendarId: {
    type: Schema.Types.ObjectId,
    ref: "Calendar",
  },
  timeZone: {
    type: String,
    required: true,
  },
  features: [
    {
      type: String,
      required: false,
    },
  ],
  slotTimes: [],
  bookDates: [
    {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      eId: {
        type: Schema.Types.ObjectId,
        ref: "BookingEvent",
      },
      isBooked: {
        type: Boolean,
        required: false,
      },
      isTaken: {
        type: Boolean,
        required: false,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

SlotBasedInventorySchema.index(
  { calendarId: 1, slotNumber: 1 },
  { unique: true }
);

const SlotBasedInventory = mongoose.model(
  "SlotBasedInventory",
  SlotBasedInventorySchema
);

module.exports = SlotBasedInventory;
