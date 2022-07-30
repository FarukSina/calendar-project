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
  specialRequests: {
    type: String,
    required: true,
    maxlength: 250,
  },
  ageOfChildren: [
    {
      children1: {
        type: String,
      },
      children2: {
        type: String,
      },
      children3: {
        type: String,
      },
      children4: {
        type: String,
      },
      children5: {
        type: String,
      },
      children6: {
        type: String,
      },
    },
  ],
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
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

bookingEventSchema.index(
  { roomId: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

const BookingEvent = mongoose.model("BookingEvent", bookingEventSchema);

module.exports = BookingEvent;
