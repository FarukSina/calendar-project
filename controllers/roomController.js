const Calendar = require("../model/calendar");
const Room = require("../model/room");
const getAllRooms = async (req, res) => {
  Room.find({}, (err, rooms) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(rooms);
    }
  });
};

const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.query.id || req.body.id);
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res) => {
  console.log("req.body.calendarId", req.body.calendarId);
  try {
    const ifCalendarAvailable = await Calendar.findById(req.body.calendarId);
    console.log("ifCalendarAvailable", ifCalendarAvailable);
    if (ifCalendarAvailable) {
      const body = {
        ...req.body,
        calendarId: req.body.calendarId,
      };
      const room = new Room(body);
      const result = await room.save();
      res.send(result);
      if (result) {
        const addRoomIdToCalendar = await Calendar.findByIdAndUpdate(
          req.body.calendarId,
          { $push: { roomIds: result._id } },
          { new: true, useFindAndModify: false }
        );
        console.log("addRoomIdToCalendar", addRoomIdToCalendar);
      }
    } else {
      res.status(404).send("Error Calendar Id not found");
    }
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id, timeZone } = req.body;
    // const bookDates = {
    //   startDate: new Date(dates.startDate),
    //   endDate: new Date(dates.endDate),
    // };

    // check if the dates are taken
    // const selectedRoom = await Room.findById(id);
    // console.log("selectedRoom", selectedRoom);
    // let roomStatus = false;
    // selectedRoom &&
    //   selectedRoom.bookDates.length > 0 &&
    //   selectedRoom?.bookDates.some((bookDate) => {
    //     const stDate = new Date(bookDate.startDate).getTime();
    //     const edDate = new Date(bookDate.endDate).getTime();
    //     const stDates = new Date(bookDates.startDate).getTime();
    //     const edDates = new Date(bookDates.endDate).getTime();
    //     if (stDate <= stDates <= edDate && stDate <= edDates <= edDate) {
    //       console.log("dates are taken");
    //       roomStatus = true;
    //       return;
    //     }
    //   });
    // if (roomStatus) {
    //   res.status(400).send("Dates are taken");
    // } else {
    const room = await Room.findOneAndUpdate({ _id: id }, { timeZone });

    if (!room) {
      res.status(404).send("Room not found");
    } else {
      res.status(200).json({
        message: "Room was updated successfully",
        status: "success",
        room: req.body,
      });
    }
    // }
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.query;
    let removeRoomIdFromCalendar;
    const room = await Room.findOneAndDelete({ _id: id });
    if (room) {
      removeRoomIdFromCalendar = await Calendar.findByIdAndUpdate(
        room.calendarId,
        { $pull: { roomIds: id } },
        { new: true, useFindAndModify: false }
      );
    }
    console.log("room", room, id);
    res.status(200).json({
      message: "Room was deleted successfully",
      room,
      removeRoomIdFromCalendar,
    });
  } catch (error) {
    next(error);
  }
};

const freeBusyRoom = async (req, res, next) => {
  try {
    const { id } = req.query;
    const result = await Room.findById(id);
    console.log("result", result);
    let freeBusyRoom = [];
    if (result !== null && result.bookDates && result.bookDates.length > 0) {
      const dates = result.bookDates.map((bookDate) => {
        return {
          startDate: bookDate.startDate,
          endDate: bookDate.endDate,
        };
      });
      console.log("dates", dates);
      freeBusyRoom = [...dates];
      res.send(freeBusyRoom);
    } else {
      res.send([]);
    }
  } catch (error) {
    next(error);
  }
};

const getAllRoomsByCalendar = async (req, res, next) => {
  try {
    const { calendarId } = req.query;
    const rooms = await Room.find({
      calendarId: calendarId,
    });
    res.send(rooms);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getAllAvailableRoomsByDates = async (req, res, next) => {
  const { startDate, endDate } = req.body;

  try {
    const rooms = await Room.find({});

    console.log("rooms", rooms);
    const newStartDate = new Date(startDate).getTime();
    const newEndDate = new Date(endDate).getTime();
    let availableRooms = [];
    rooms &&
      rooms.length > 0 &&
      rooms.forEach((room) => {
        if (room.bookDates.length > 0) {
          const isBooked = room.bookDates.some((bookDate) => {
            const selectedStartDate = new Date(bookDate.startDate).getTime();
            const selectedEndDate = new Date(bookDate.endDate).getTime();
            console.log("taken", selectedStartDate, newStartDate);
            if (
              (selectedStartDate >= newStartDate &&
                selectedStartDate <= newEndDate) ||
              (selectedEndDate >= newStartDate && selectedEndDate <= newEndDate)
            ) {
              console.log("dates are taken");
              return true;
            } else {
              return false;
            }
          });
          console.log("isBooked", isBooked);
          if (isBooked) {
            return;
          } else {
            availableRooms.push(room);
          }
        } else {
          availableRooms.push(room);
        }
      });
    res.send(availableRooms);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getAllAvailableRoomsByDatesFunc = async (
  calendarId,
  startDate,
  endDate
) => {
  try {
    const rooms = await Room.find({
      calendarId: calendarId,
    });
    console.log("rooms", rooms);
    const newStartDate = new Date(startDate).getTime();
    const newEndDate = new Date(endDate).getTime();
    let availableRooms = [];
    rooms &&
      rooms.length > 0 &&
      rooms.forEach((room) => {
        if (room.bookDates.length > 0) {
          const isBooked = room.bookDates.some((bookDate) => {
            const selectedStartDate = new Date(bookDate.startDate).getTime();
            const selectedEndDate = new Date(bookDate.endDate).getTime();
            console.log("taken", selectedStartDate, newStartDate);
            if (
              (selectedStartDate >= newStartDate &&
                selectedStartDate <= newEndDate) ||
              (selectedEndDate >= newStartDate && selectedEndDate <= newEndDate)
            ) {
              console.log("dates are taken");
              return true;
            } else {
              return false;
            }
          });
          console.log("isBooked", isBooked);
          if (isBooked) {
            return;
          } else {
            availableRooms.push(room);
          }
        } else {
          availableRooms.push(room);
        }
      });
    return availableRooms;
  } catch (error) {
    return { message: error.message };
  }
};

module.exports = {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  freeBusyRoom,
  getAllRoomsByCalendar,
  getAllAvailableRoomsByDates,
  getAllAvailableRoomsByDatesFunc,
};
