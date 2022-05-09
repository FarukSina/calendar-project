const Calendar = require("../model/calendar");
const Hotel = require("../model/hotel");
const { getAllAvailableRoomsByDatesFunc } = require("./roomController");

// Calendar Endpoints

const getAllCalendars = async (req, res) => {
  Calendar.find({}, (err, calendars) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(calendars);
    }
  });
};

const getCalendar = async (req, res, next) => {
  try {
    const calendar = await Calendar.findById(req.query.id || req.body.id);
    res.status(200).json(calendar);
  } catch (error) {
    next(error);
  }
};

const createCalendar = async (req, res) => {
  const calendar = new Calendar(req.body);
  try {
    const result = await calendar.save();
    let updateHotel = [];
    if (result && result.hotelId) {
      updateHotel = await Hotel.findOneAndUpdate(
        { _id: result.hotelId },
        { $push: { calendarIds: result._id } },
        { new: true, useFindAndModify: false }
      );
    }
    res.send({ result, updateHotel });
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateCalendar = async (req, res, next) => {
  try {
    const { id, calendarName } = req.body;

    const calendar = await Calendar.findOneAndUpdate(id, {
      calendarName,
    });
    if (!calendar) {
      res.status(404).send("Calendar not found");
    } else {
      res.status(200).json({
        message: "Calendar was updated successfully",
        status: "success",
        calendar: req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteCalendar = async (req, res, next) => {
  try {
    const { id } = req.query;
    const calendar = await Calendar.deleteOne({ _id: id });
    console.log("calendar", calendar, id);
    res.status(200).json({ message: "Calendar was deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllCalendarsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.query;
    const calendar = await Calendar.find({ hotelId });
    res.status(200).json(calendar);
  } catch (error) {
    next(error);
  }
};

const getInventoryRoomsByCalendar = async (req, res, next) => {
  try {
    let colorCode = "";
    const { calendarId, startDate, endDate } = req.body;
    console.log("req.body", req.body);
    const calendar = await Calendar.findById({ _id: calendarId });
    const hotelName = await Hotel.findById({
      _id: calendar.hotelId,
    });
    const quantityOfRoom = calendar && calendar.roomIds?.length;
    const roomsAvailableByCalendar = await getAllAvailableRoomsByDatesFunc(
      calendarId,
      startDate,
      endDate
    );
    console.log(
      "result",
      calendar.hotelId,
      quantityOfRoom,
      roomsAvailableByCalendar,
      hotelName
    );

    const roomsAvailable =
      quantityOfRoom &&
      roomsAvailableByCalendar &&
      quantityOfRoom - roomsAvailableByCalendar.length;

    console.log(roomsAvailableByCalendar.length / quantityOfRoom);
    if (roomsAvailableByCalendar.length / quantityOfRoom <= 0.2) {
      colorCode = "#34deeb";
    } else if (roomsAvailableByCalendar.length / quantityOfRoom <= 0.35) {
      colorCode = "#34eb71";
    } else if (roomsAvailableByCalendar.length / quantityOfRoom <= 0.5) {
      colorCode = "#dfeb34";
    } else if (roomsAvailableByCalendar.length / quantityOfRoom <= 0.65) {
      colorCode = "#eb8f34";
    } else if (roomsAvailableByCalendar.length / quantityOfRoom <= 0.85) {
      colorCode = "#eb6834";
    } else {
      colorCode = "#eb3434";
    }

    res.status(200).json({
      calendarName: calendar.calendarName,
      hotelName: hotelName.hotelName,
      quantityOfRoom,
      roomsAvailable: roomsAvailable,
      takenRooms: roomsAvailableByCalendar.length,
      colorCode: colorCode,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCalendars,
  getCalendar,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  getAllCalendarsByHotel,
  getInventoryRoomsByCalendar,
};
