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
    const newStartDate = new Date(bookDates.startDate).getTime();
    const newEndDate = new Date(bookDates.endDate).getTime();
    const currentTime = new Date(new Date().setHours(11, 00, 00)).getTime();
    if (newStartDate < currentTime) {
      res.status(400).send("Room can not be before current time");
      return;
    }
    if (newStartDate > newEndDate) {
      res.status(400).send("Start date should be less than end date");
      return;
    }
    const selectedRoom = await Room.findById(roomId);
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

    bookDates["eId"] = result._id;
    bookDates["isBooked"] = false;
    bookDates["userId"] = result.userId;

    // check if the dates are taken

    const room = await Room.findOneAndUpdate(
      { _id: roomId },
      {
        $push: { bookDates: bookDates },
      }
    );

    if (!room) {
      res.status(404).send("Room not found");
    } else {
      const sessionTime = new Date(Date.now() + 15 * 60 * 1000);
      console.log("\n\n result213213312 \n \n ", result);
      res.status(200).json({
        message: "Room was updated successfully",
        status: "success",
        room: room,
        event: { ...result?._doc, sessionTime },
      });
      return;
    }
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const createMultipleBookingEvent = async (req, res, next) => {
  const bookingEvents = {};
  const { quantity, roomIds } = req.body;
  if (quantity >= 1) {
    for (let i = 0; i < quantity; i++) {
      let tempBookingEvent = new BookingEvent({
        numberOfAttendees: req.body.numberOfAttendees,
        numberOfAdults: req.body.numberOfAdults,
        numberOfChildren: req.body.numberOfChildren,
        summary: req.body.summary,
        description: req.body.description,
        roomId: roomIds[i],
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        userId: req.body.userId,
        timeZone: req.body.timeZone,
        personName: req.body.userList[`user${i + 1}`],
      });
      bookingEvents[`roomEvent${i + 1}`] = tempBookingEvent;
    }
  }
  try {
    const { timeZone, startDate, endDate } = req.body;
    const bookDates = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeZone: timeZone,
    };
    const newStartDate = new Date(bookDates.startDate).getTime();
    const newEndDate = new Date(bookDates.endDate).getTime();
    const currentTime = new Date(new Date().setHours(11, 00, 00)).getTime();
    if (newStartDate < currentTime) {
      res.status(400).send("Room can not be before current time");
      return;
    }
    if (newStartDate > newEndDate) {
      res.status(400).send("Start date should be less than end date");
      return;
    }
    let selectedRooms = {};
    if (bookingEvents && Object.keys(bookingEvents).length > 0) {
      selectedRooms = await Room.find({ _id: { $in: roomIds } });
    }
    let isDateTaken = false;

    if (selectedRooms && Object.keys(selectedRooms).length > 0) {
      selectedRooms.forEach((room) => {
        room &&
          room?.bookDates?.length > 0 &&
          room?.bookDates?.some((bookDate) => {
            const selectedStartDate = new Date(bookDate.startDate).getTime();
            const selectedEndDate = new Date(bookDate.endDate).getTime();
            if (
              selectedStartDate === newStartDate &&
              selectedEndDate === newStartDate
            ) {
              console.log("dates are taken");
              isDateTaken = true;
              return;
            }
          });
        // if (room) {
        //   room.roomTimes.find((roomTime) => {
        //     if (
        //       new Date(roomTime.date).toDateString() ===
        //       new Date(bookDates.startDate).toDateString()
        //     ) {
        //       isRoomMatch = false;
        //       const findRoomTime = roomTime?.rooms?.find((room) => {
        //         if (
        //           new Date(room.startTime).getTime() ===
        //             new Date(bookDates.startDate).getTime() &&
        //           new Date(room.endTime).getTime() ===
        //             new Date(bookDates.endDate).getTime()
        //         ) {
        //           return room;
        //         }
        //       });
        //       console.log("findRoomTime", findRoomTime);
        //       if (findRoomTime) {
        //         isRoomMatch = true;
        //         return;
        //       }
        //     }
        //   });
        // }
      });
    }

    if (isDateTaken) {
      res.status(400).send("Dates are taken");
      return;
    }

    const asyncFunction = async () => {
      let multipleBookingEvents = Object.keys(bookingEvents).reduce(
        async (a, key) => {
          return a.then(async () => {
            let _result = null;
            return bookingEvents[key]
              .save()
              .then((result) => {
                _result = result;
                bookDates["eId"] = result._id;
                bookDates["isBooked"] = false;
                bookDates["userId"] = result.userId;

                return Room.findOneAndUpdate(
                  { _id: result.roomId },
                  {
                    $push: { bookDates: bookDates },
                  }
                );
              })
              .then(async (room) => {
                const lastRoom = await a;
                console.log("lastRoom", lastRoom);
                return {
                  ...lastRoom,
                  [key]: {
                    id: _result.roomId,
                    message: "Room and Room Event updated successfully",
                    status: "success",
                    roomEvent: { ..._result?._doc },
                    room: room,
                  },
                };
              });
          });

          // const result = await bookingEvents[key].save();
          // console.log("result12", result);
          // bookDates["eId"] = result._id;
          // bookDates["isBooked"] = false;
          // bookDates["userId"] = result.userId;
          // const room = await Room.findOneAndUpdate(
          //   { _id: roomId },
          //   {
          //     $push: { bookDates: bookDates },
          //   }
          // );
          // console.log("result123", room);
          // if (result && room) {
          //   results.push({
          //     message: "Room and Room Event updated successfully",
          //     status: "success",
          //     roomEvent: { ...result?._doc },
          //     room: room,
          //   });
          //   console.log("results1234", results);
          // }
        },
        Promise.resolve()
      );
      return multipleBookingEvents;
    };

    if (bookingEvents && Object.keys(bookingEvents).length > 0) {
      const roomResults = await asyncFunction();
      console.log("roomResults123", roomResults);
      if (!roomResults || Object.keys(roomResults).length === 0) {
        res.status(404).json({
          message: "Room and Room Event not updated",
          status: "failure",
        });
      } else {
        const sessionTime = new Date(Date.now() + 15 * 60 * 1000);
        res.status(200).json({
          ...roomResults,
          sessionTime,
          status: "success",
        });
        return;
      }
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const bookTheRoomEvent = async (req, res, next) => {
  try {
    const { eId, userId } = req.body;
    let roomAlreadyBooked = false;
    const bookingEvent = await BookingEvent.findOne({
      _id: eId,
      userId: userId,
    });
    console.log("bookingEvent", bookingEvent.isBooked);
    if (bookingEvent.isBooked) {
      roomAlreadyBooked = true;
    }
    if (roomAlreadyBooked) {
      console.log("roomAlreadyBooked", roomAlreadyBooked);
      return res.status(400).send("Room is already booked");
    }
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

const bookMultipleRoomEvents = async (req, res, next) => {
  try {
    const { eventList, userId } = req.body;
    let roomAlreadyBooked = {};
    console.log("eventList", eventList, userId);
    const asyncFunction = async () => {
      let multipleBookingEvents = Object.keys(eventList).reduce(
        async (a, key) => {
          return a.then(async () => {
            let _result = null;
            let roomAlreadyBooked = {};

            return await BookingEvent.findOneAndUpdate(
              { _id: eventList?.[key]?.roomEvent?._id, userId: userId },
              { $set: { isBooked: true } }
            )
              .then(async (result) => {
                const bookingEvent = await BookingEvent.findOne({
                  _id: eventList?.[key]?.roomEvent?._id,
                  userId: userId,
                });
                console.log(
                  "bookingEvent123",
                  bookingEvent,
                  bookingEvent.isBooked
                );
                if (bookingEvent.isBooked) {
                  roomAlreadyBooked[key] = {
                    isBooked: true,
                    roomEvent: { ...bookingEvent?._doc },
                  };
                  return result;
                }
                return await result;
              })
              .then((result) => {
                _result = result;
                return Room.updateOne(
                  { "bookDates.eId": eventList?.[key]?.roomEvent?._id },
                  {
                    $set: {
                      "bookDates.$.isBooked": true,
                    },
                  },
                  { multi: true }
                );
              })
              .then(async (room) => {
                const lastRoom = await a;
                console.log("lastRoom", lastRoom);
                return {
                  ...lastRoom,
                  [key]: {
                    id: _result.roomId,
                    message: "Room and Room Event updated successfully",
                    status: "success",
                    roomEvent: { ..._result?._doc },
                    room: room,
                  },
                  roomAlreadyBooked,
                  alreadyBookedRoomsLength:
                    Object.keys(roomAlreadyBooked)?.length,
                };
              });
          });
        },
        Promise.resolve()
      );
      return multipleBookingEvents;
    };

    if (Object.keys(eventList).length === 0) {
      return res.status(400).send("No events to book");
    }

    const result = await asyncFunction();

    if (
      result &&
      result?.roomAlreadyBooked &&
      Object.keys(result?.roomAlreadyBooked)?.length ===
        Object.keys(eventList)?.length
    ) {
      console.log("roomAlreadyBooked", roomAlreadyBooked);
      return res.status(400).json({
        message: "The Room is already booked",
        roomAlreadyBooked: result?.roomAlreadyBooked,
      });
    }

    console.log("result", result);

    if (!result || Object.keys(result)?.length === 0) {
      res.status(404).send("Room or Event not found");
    } else {
      res.status(200).json({
        message: "Room and Event booked successfully",
        status: "success",
        result,
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
    const { id, roomId, userId } = req.body;

    const bookingEvent = await BookingEvent.deleteOne({
      _id: id,
      userId: userId,
    });
    // const roomBookingEvent = await Room.findOneAndUpdate(
    //   { _id: roomId },
    //   { $pull: { bookDates: { eId: id } } }
    // );
    const roomBookingEvent = await Room.findOneAndUpdate(
      { _id: roomId },
      { $pull: { bookDates: { eId: id, userId: userId } } },
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

const deleteBookingEventByCronJob = async (id, roomId) => {
  try {
    const bookingEvent = await BookingEvent.deleteOne({
      _id: id,
    });

    const roomBookingEvent = await Room.findOneAndUpdate(
      { _id: roomId },
      { $pull: { bookDates: { eId: id } } },
      { safe: true, multi: false }
    );

    if (bookingEvent && bookingEvent.deletedCount === 1) {
      return {
        message: "bookingEvent was deleted successfully",
        bookingEventId: id,
        roomId: roomBookingEvent._id,
      };
    } else {
      return `bookingEvent not found for the given id: ${id}`;
    }
  } catch (error) {
    return error;
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

const updateSessionTime = async (req, res, next) => {
  try {
    const { eId, userId, roomId } = req.body;
    currentTime = Date.now();

    const bookingEvent = await BookingEvent.findOneAndUpdate(
      { _id: eId, userId: userId },
      { updatedAt: currentTime },
      { new: true }
    );

    console.log("updated bookingEvent", bookingEvent, currentTime);

    const sessionTime = new Date(currentTime + 15 * 60 * 1000);
    res.status(200).send({
      bookingEvent: bookingEvent,
      sessionTimeUpdated: sessionTime,
    });
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateMultipleSessionTime = async (req, res, next) => {
  try {
    const { eventList } = req.body;
    console.log("eventList1", eventList, req.body);
    currentTime = Date.now();

    const asyncFunction = async () => {
      let multipleRoomEvents = Object.keys(eventList).reduce(async (a, key) => {
        return a
          .then(async () => {
            const bookedEvent = eventList[key].roomEvent;
            console.log("bookedEvent", bookedEvent);
            const { _id, userId } = bookedEvent;
            console.log("Update Session Time Room Event", _id, userId);
            return await BookingEvent.findOneAndUpdate(
              { _id: bookedEvent._id, userId: bookedEvent.userId },
              { updatedAt: currentTime },
              { new: true, safe: true, multi: false }
            );
          })
          .then(async (bookedEvent) => {
            const lastBookingEvent = await a;
            console.log("lastBookingEvent222", lastBookingEvent);
            return {
              ...lastBookingEvent,
              [key]: bookedEvent,
            };
          });
      }, Promise.resolve());
      return multipleRoomEvents;
    };

    if (eventList && Object.keys(eventList).length > 0) {
      const updatedEventResults = await asyncFunction();
      console.log("updatedEventResults", updatedEventResults);
      if (
        !updatedEventResults ||
        Object.keys(updatedEventResults).length === 0
      ) {
        res.status(404).json({
          message: "Room Event not updated",
          status: "failure",
        });
      } else {
        const sessionTime = new Date(Date.now() + 15 * 60 * 1000);
        res.status(200).json({
          ...updatedEventResults,
          sessionTimeUpdated: sessionTime,
          status: "success",
        });
      }
    }
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

module.exports = {
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
  deleteBookingEventByCronJob,
  updateSessionTime,
  updateMultipleSessionTime,
  bookMultipleRoomEvents,
};
