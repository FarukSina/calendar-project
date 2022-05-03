const Event = require("../model/event");

const getAllEvents = async (req, res) => {
  Event.find({}, (err, events) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(events);
    }
  });
};

const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.query.id || req.body.id);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res) => {
  const event = new Event(req.body);
  try {
    const result = await event.save();
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id, eventName } = req.body;

    const event = await Event.findOneAndUpdate(id, {
      eventName,
    });
    if (!event) {
      res.status(404).send("Event not found");
    } else {
      res.status(200).json({
        message: "Event was updated successfully",
        status: "success",
        event: req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.query;
    const event = await Event.deleteOne({ _id: id });
    console.log("event", event, id);
    res.status(200).json({ message: "Event was deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
