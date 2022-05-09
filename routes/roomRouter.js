const express = require("express");
const router = express.Router();

const {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  freeBusyRoom,
  getAllRoomsByCalendar,
  getAllAvailableRoomsByDates,
} = require("../controllers/roomController");

router.route("/getAllRooms").get(getAllRooms);
router.route("/getRoom").get(getRoom);
router.route("/freeBusyRoom").get(freeBusyRoom);
router.route("/getAllRoomsByCalendar").get(getAllRoomsByCalendar);
router.route("/getAllAvailableRoomsByDates").get(getAllAvailableRoomsByDates);
router.route("/createRoom").post(createRoom);
router.route("/updateRoom").post(updateRoom);
router.route("/deleteRoom").post(deleteRoom);

module.exports = router;
