const express = require("express");
const router = express.Router();

const {
  createSlotEvent,
  createMultipleSlotEvent,
  getAllSlotEvents,
  getSlotEvent,
  deleteSlotEvent,
  updateSessionTime,
  updateMultipleSessionTime,
  bookTheSlotEvent,
} = require("../controllers/slotEventController");

router.route("/getAllSlotEvents").get(getAllSlotEvents);
router.route("/getSlotEvent").get(getSlotEvent);
router.route("/createSlotEvent").post(createSlotEvent);
router.route("/createMultipleSlotEvent").post(createMultipleSlotEvent);
router.route("/deleteSlotEvent").post(deleteSlotEvent);
router.route("/updateSessionTime").post(updateSessionTime);
router.route("/bookSlotEvent").post(bookTheSlotEvent);
router.route("/updateMultipleSessionTime").post(updateMultipleSessionTime);

module.exports = router;
