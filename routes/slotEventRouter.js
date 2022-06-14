const express = require("express");
const router = express.Router();

const {
  createSlotEvent,
  getAllSlotEvents,
  deleteSlotEvent,
  updateSessionTime,
  bookTheSlotEvent,
} = require("../controllers/slotEventController");

router.route("/getAllSlotEvents").get(getAllSlotEvents);
router.route("/createSlotEvent").post(createSlotEvent);
router.route("/deleteSlotEvent").post(deleteSlotEvent);
router.route("/updateSessionTime").post(updateSessionTime);
router.route("/bookSlotEvent").post(bookTheSlotEvent);

module.exports = router;
