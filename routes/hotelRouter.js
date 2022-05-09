const express = require("express");
const router = express.Router();
const {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

router.route("/getAllHotels").get(getAllHotels);
router.route("/getHotel").get(getHotel);
router.route("/createHotel").post(createHotel);
router.route("/updateHotel").post(updateHotel);
router.route("/deleteHotel").post(deleteHotel);

module.exports = router;
