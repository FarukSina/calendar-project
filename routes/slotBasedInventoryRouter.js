const express = require("express");
const router = express.Router();

const {
  getAllSlots,
  getSlot,
  createSlot,
  updateSlot,
  deleteSlot,
  freeBusySlot,
  getAllSlotsByCalendar,
  getAllAvailableDatesBySlots,
  getAllAvailableSlotsByDate,
} = require("../controllers/slotBasedInventoryController");

router.route("/getAllSlots").get(getAllSlots);
router.route("/getSlot").get(getSlot);
router.route("/freeBusySlot").get(freeBusySlot);
router.route("/getAllSlotsByCalendar").get(getAllSlotsByCalendar);
router.route("/getAllAvailableDatesBySlots").post(getAllAvailableDatesBySlots);
router.route("/createSlot").post(createSlot);
router.route("/updateSlot").post(updateSlot);
router.route("/deleteSlot").post(deleteSlot);
router.route("/getAllAvailableSlotsByDate").post(getAllAvailableSlotsByDate);

module.exports = router;
