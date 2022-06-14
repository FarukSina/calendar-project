const Calendar = require("../model/calendar");
const Merchant = require("../model/merchant");
const { getAllAvailableRoomsByDatesFunc } = require("./roomController");
var fs = require("fs");

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
    let updateMerchant = [];
    if (result && result.merchantId) {
      updateMerchant = await Merchant.findOneAndUpdate(
        { _id: result.merchantId },
        { $push: { calendarIds: result._id } },
        { new: true, useFindAndModify: false }
      );
    }
    res.send({ result, updateMerchant });
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
    const { merchantId } = req.query;
    const calendar = await Calendar.find({ merchantId });
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
    const hotelName = await Merchant.findById({
      _id: calendar.merchantId,
    });
    const roomQuantitiesOfCalendar = calendar && calendar.roomIds?.length;
    const roomsAvailableByCalendar = await getAllAvailableRoomsByDatesFunc(
      calendarId,
      startDate,
      endDate
    );

    const availableRooms =
      roomQuantitiesOfCalendar &&
      roomsAvailableByCalendar &&
      roomsAvailableByCalendar.length;

    const takenRooms = roomQuantitiesOfCalendar - availableRooms;

    console.log(
      "takenRooms",
      takenRooms,
      roomQuantitiesOfCalendar,
      availableRooms
    );

    console.log(takenRooms / roomQuantitiesOfCalendar);
    if (takenRooms / roomQuantitiesOfCalendar <= 0.2) {
      colorCode = "#34deeb";
    } else if (takenRooms / roomQuantitiesOfCalendar <= 0.35) {
      colorCode = "#34eb71";
    } else if (takenRooms / roomQuantitiesOfCalendar <= 0.5) {
      colorCode = "#dfeb34";
    } else if (takenRooms / roomQuantitiesOfCalendar <= 0.65) {
      colorCode = "#eb8f34";
    } else if (takenRooms / roomQuantitiesOfCalendar <= 0.85) {
      colorCode = "#eb6834";
    } else {
      colorCode = "#eb3434";
    }

    res.status(200).json({
      calendarName: calendar.calendarName,
      hotelName: hotelName.hotelName,
      roomQuantitiesOfCalendar,
      availableRooms: availableRooms,
      takenRooms: takenRooms,
      colorCode: colorCode,
      startDate: startDate,
      endDate: endDate,
    });
  } catch (error) {
    next(error);
  }
};

const getTimeZones = async (req, res, next) => {
  try {
    const timeZones = await fs.readFileSync("./json/timezones.json", "utf8");
    res.status(200).send(timeZones);
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
  getTimeZones,
};
