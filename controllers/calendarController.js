const Calendar = require("../model/calendar");

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
    res.send(result);
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

module.exports = {
  getAllCalendars,
  getCalendar,
  createCalendar,
  updateCalendar,
  deleteCalendar,
};
