const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  calendarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Calendar",
    required: true,
  },
  bookDates: {
    type: Array,
    timeZone: {
      type: String,
      required: true,
    },
  },
});

RoomSchema.index({ calendarId: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
