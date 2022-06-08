const mongoose = require("mongoose");

const slotEventSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SlotBasedInventory",
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  timeZone: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  updatedAt: {
    type: Number,
    default: Date.now(),
  },
});

slotEventSchema.index(
  { slotId: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

const SlotEvent = mongoose.model("SlotEvent", slotEventSchema);

module.exports = SlotEvent;
