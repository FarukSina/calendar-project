const express = require("express");
const router = express.Router();

const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

router.route("/getAllEvents").get(getAllEvents);
router.route("/getEvent").get(getEvent);
router.route("/createEvent").post(createEvent);
router.route("/updateEvent").post(updateEvent);
router.route("/deleteEvent").post(deleteEvent);

module.exports = router;
