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
  const room = new Room(req.body);
  try {
    const result = await room.save();
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id, dates } = req.body;
    const bookDates = {
      startDate: new Date(dates.startDate),
      endDate: new Date(dates.endDate),
    };

    // check if the dates are taken
    const selectedRoom = await Room.findById(id);
    console.log("selectedRoom", selectedRoom);
    let roomStatus = false;
    selectedRoom &&
      selectedRoom.bookDates.length > 0 &&
      selectedRoom?.bookDates.some((bookDate) => {
        const stDate = new Date(bookDate.startDate).getTime();
        const edDate = new Date(bookDate.endDate).getTime();
        const stDates = new Date(bookDates.startDate).getTime();
        const edDates = new Date(bookDates.endDate).getTime();
        if (stDate <= stDates <= edDate && stDate <= edDates <= edDate) {
          console.log("dates are taken");
          roomStatus = true;
          return;
        }
      });
    if (roomStatus) {
      res.status(400).send("Dates are taken");
    } else {
      const room = await Room.findOneAndUpdate(id, {
        $push: { bookDates: bookDates },
      });

      if (!room) {
        res.status(404).send("Room not found");
      } else {
        res.status(200).json({
          message: "Room was updated successfully",
          status: "success",
          room: req.body,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.query;
    const room = await Room.deleteOne({ _id: id });
    console.log("room", room, id);
    res.status(200).json({ message: "Room was deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
