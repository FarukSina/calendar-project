const express = require("express");
const router = express.Router();

const {
  createSlotEvent,
  getAllSlotEvents,
  deleteSlotEvent,
} = require("../controllers/slotEventController");

router.route("/getAllSlotEvents").get(getAllSlotEvents);
router.route("/createSlotEvent").post(createSlotEvent);
router.route("/deleteSlotEvent").post(deleteSlotEvent);

module.exports = router;
