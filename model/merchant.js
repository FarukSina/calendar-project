const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MerchantSchema = new Schema({
  merchantName: {
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

const Merchant = mongoose.model("Merchant", MerchantSchema);

module.exports = Merchant;
