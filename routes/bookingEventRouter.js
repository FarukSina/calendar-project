const express = require("express");
const router = express.Router();

const {
  getAllBookingEvents,
  getBookingEvent,
  createBookingEvent,
  createMultipleBookingEvent,
  updateBookingEvent,
  deleteBookingEvent,
  getBookingEventsByUserId,
  getBookingEventsByRoomId,
  getAllBookingEventsByUserId,
  bookTheRoomEvent,
  updateSessionTime,
  updateMultipleSessionTime,
  bookMultipleRoomEvents,
} = require("../controllers/bookingEventController");

router.route("/getAllBookingEvents").get(getAllBookingEvents);
router.route("/getBookingEvent").get(getBookingEvent);
router.route("/getAllBookingEventsByUserId").get(getAllBookingEventsByUserId);
router.route("/getBookingEventsByRoomId").get(getBookingEventsByRoomId);
router.route("/getBookingEventsByUserId").get(getBookingEventsByUserId);
router.route("/createBookingEvent").post(createBookingEvent);
router.route("/createMultipleBookingEvent").post(createMultipleBookingEvent);
router.route("/updateBookingEvent").post(updateBookingEvent);
router.route("/bookTheRoomEvent").post(bookTheRoomEvent);
router.route("/deleteBookingEvent").post(deleteBookingEvent);
router.route("/updateSessionTime").post(updateSessionTime);
router.route("/updateMultipleSessionTime").post(updateMultipleSessionTime);
router.route("/bookMultipleRoomEvents").post(bookMultipleRoomEvents);

module.exports = router;
