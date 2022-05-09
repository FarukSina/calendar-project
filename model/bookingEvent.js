const mongoose = require("mongoose");

const bookingEventSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  numberOfAttendees: {
    type: Number,
    required: true,
  },
  numberOfAdults: {
    type: Number,
    required: true,
  },
  numberOfChildren: {
    type: Number,
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
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
});

bookingEventSchema.index(
  { roomId: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

const BookingEvent = mongoose.model("BookingEvent", bookingEventSchema);

module.exports = BookingEvent;
