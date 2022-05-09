const express = require("express");
const router = express.Router();

const {
  getAllBookingEvents,
  getBookingEvent,
  createBookingEvent,
  updateBookingEvent,
  deleteBookingEvent,
  getBookingEventsByUserId,
  getBookingEventsByRoomId,
  getAllBookingEventsByUserId,
  bookTheRoomEvent,
} = require("../controllers/bookingEventController");

router.route("/getAllBookingEvents").get(getAllBookingEvents);
router.route("/getBookingEvent").get(getBookingEvent);
router.route("/getAllBookingEventsByUserId").get(getAllBookingEventsByUserId);
router.route("/getBookingEventsByRoomId").get(getBookingEventsByRoomId);
router.route("/getBookingEventsByUserId").get(getBookingEventsByUserId);
router.route("/createBookingEvent").post(createBookingEvent);
router.route("/updateBookingEvent").post(updateBookingEvent);
router.route("/bookTheRoomEvent").post(bookTheRoomEvent);
router.route("/deleteBookingEvent").post(deleteBookingEvent);

module.exports = router;
