const express = require("express");
const router = express.Router();
const {
  getAllCalendars,
  getCalendar,
  createCalendar,
  updateCalendar,
  deleteCalendar,
} = require("../controllers/calendarController");

router.route("/getAllCalendars").get(getAllCalendars);
router.route("/getCalendar").get(getCalendar);
router.route("/createCalendar").post(createCalendar);
router.route("/updateCalendar").post(updateCalendar);
router.route("/deleteCalendar").post(deleteCalendar);

module.exports = router;
