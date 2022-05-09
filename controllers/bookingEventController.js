const BookingEvent = require("../model/bookingEvent");
const Room = require("../model/room");
const getAllBookingEvents = async (req, res) => {
  BookingEvent.find({}, (err, bookingEvents) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(bookingEvents);
    }
  });
};

const getBookingEvent = async (req, res, next) => {
  try {
    const bookingEvent = await BookingEvent.findById(
      req.query.id || req.body.id
    );
    res.status(200).json(bookingEvent);
  } catch (error) {
    next(error);
  }
};

const createBookingEvent = async (req, res, next) => {
  const bookingEvent = new BookingEvent({
    summary: req.body.summary,
    description: req.body.description,
    numberOfAttendees: req.body.numberOfAttendees,
    numberOfAdults: req.body.numberOfAdults,
    numberOfChildren: req.body.numberOfChildren,
    roomId: req.body.roomId,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    userId: req.body.userId,
    timeZone: req.body.timeZone,
  });
  try {
    const { roomId, startDate, endDate } = req.body;
    const bookDates = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeZone: req.body.timeZone,
    };
    console.log("bookDates", bookDates, new Date(startDate), startDate);
    const newStartDate = new Date(bookDates.startDate).getTime();
    const newEndDate = new Date(bookDates.endDate).getTime();
    if (newStartDate > newEndDate) {
      res.status(400).send("Start date should be less than end date");
      return;
    }
    const selectedRoom = await Room.findById(roomId);
    console.log("selectedRoom", selectedRoom);
    let roomStatus = false;
    selectedRoom &&
      selectedRoom.bookDates.length > 0 &&
      selectedRoom?.bookDates.some((bookDate) => {
        const selectedStartDate = new Date(bookDate.startDate).getTime();
        const selectedEndDate = new Date(bookDate.endDate).getTime();
        if (
          (selectedStartDate <= newEndDate &&
            selectedStartDate >= newStartDate) ||
          (selectedEndDate <= newEndDate && selectedEndDate >= newStartDate)
        ) {
          console.log("dates are taken");
          roomStatus = true;
          return;
        }
      });

    if (roomStatus) {
      res.status(400).send("Dates are taken");
      return;
    }

    // const bookingEvent = new bookingEvent(req.body);
    const result = await bookingEvent.save();
    console.log("result2", result, roomId);

    bookDates["eId"] = result._id;
    bookDates["isBooked"] = false;

    console.log("bookDates2", bookDates);
    // check if the dates are taken

    const room = await Room.findOneAndUpdate(
      { _id: roomId },
      {
        $push: { bookDates: bookDates },
      }
    );

    console.log("room", room);

    if (!room) {
      res.status(404).send("Room not found");
    } else {
      res.status(200).json({
        message: "Room was updated successfully",
        status: "success",
        room: room,
        event: result,
      });
      return;
    }
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const bookTheRoomEvent = async (req, res, next) => {
  try {
    const { eId, userId } = req.body;
    const bookEvent = await BookingEvent.findOneAndUpdate(
      { _id: eId, userId: userId },
      { $set: { isBooked: true } }
    );
    console.log("bookEvent", bookEvent);
    const roomEvent = await Room.updateOne(
      { "bookDates.eId": eId },
      {
        $set: {
          "bookDates.$.isBooked": true,
        },
      },
      { multi: true }
    );
    console.log("roomEvent", roomEvent);

    console.log("roomEvent", roomEvent);
    if (!roomEvent || !bookEvent) {
      res.status(404).send("Room or Event not found");
    } else {
      res.status(200).json({
        message: "Room and Event booked successfully",
        status: "success",
        room: roomEvent,
        event: bookEvent,
      });
      return;
    }
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateBookingEvent = async (req, res, next) => {
  try {
    const { id, ...rest } = req.body;
    const bookingEvent = await BookingEvent.findOneAndUpdate(id, {
      ...rest,
    });
    if (!bookingEvent) {
      res.status(404).send("bookingEvent not found");
    } else {
      res.status(200).json({
        message: "bookingEvent was updated successfully",
        status: "success",
        bookingEvent: req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteBookingEvent = async (req, res, next) => {
  try {
    const { id, roomId } = req.body;
    const bookingEvent = await BookingEvent.deleteOne({ _id: id });
    // const roomBookingEvent = await Room.findOneAndUpdate(
    //   { _id: roomId },
    //   { $pull: { bookDates: { eId: id } } }
    // );
    const roomBookingEvent = await Room.findOneAndUpdate(
      { _id: roomId },
      { $pull: { bookDates: { eId: id } } },
      { safe: true, multi: false }
    );

    console.log("bookingEvent", bookingEvent, roomBookingEvent);

    if (bookingEvent && bookingEvent.deletedCount === 1) {
      res.status(200).json({
        message: "bookingEvent was deleted successfully",
        bookingEventId: id,
      });
    } else {
      res.status(404).send(`bookingEvent not found for the given id: ${id}`);
    }
  } catch (error) {
    next(error);
  }
};

const getBookingEventsByUserId = async (req, res, next) => {
  try {
    const bookingEvents = await BookingEvent.find({ userId: req.query.id });
    res.status(200).json(bookingEvents);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
    next(error);
  }
};

const getBookingEventsByRoomId = async (req, res, next) => {
  try {
    const bookingEvents = await BookingEvent.find({ roomId: req.query.roomId });
    res.status(200).json(bookingEvents);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
    next(error);
  }
};

const getAllBookingEventsByUserId = async (req, res, next) => {
  try {
    const bookingEvents = await BookingEvent.find({ userId: req.query.id });
    res.status(200).json(bookingEvents);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
    next(error);
  }
};

module.exports = {
  getAllBookingEvents,
  getBookingEvent,
  createBookingEvent,
  updateBookingEvent,
  deleteBookingEvent,
  getBookingEventsByUserId,
  getBookingEventsByRoomId,
  getAllBookingEventsByUserId,
  bookTheRoomEvent,
};
