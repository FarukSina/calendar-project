const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomName: {
    type: String,
    required: true,
  },
  roomNumber: {
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
  numberOfBeds: {
    type: Number,
    required: true,
    default: 1,
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
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
        ref: "bookingEvent",
      },
      isBooked: {
        type: Boolean,
        required: false,
      },
    },
  ],
});

RoomSchema.index({ calendarId: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
