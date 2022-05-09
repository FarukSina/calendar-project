const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HotelSchema = new Schema({
  hotelName: {
    type: String,
    unique: true,
    required: true,
  },
  calendarIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Calendar",
    },
  ],
});

const Hotel = mongoose.model("Hotel", HotelSchema);

module.exports = Hotel;
