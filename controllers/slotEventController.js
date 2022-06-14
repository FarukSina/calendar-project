const Slot = require("../model/slotBasedInventory");
const SlotEvent = require("../model/slotEvent");

const getAllSlotEvents = async (req, res, next) => {
  try {
    const slotEvents = await SlotEvent.find({});
    res.status(200).json(slotEvents);
  } catch (error) {
    next(error);
  }
};
const createSlotEvent = async (req, res, next) => {
  const slotEvent = new SlotEvent({
    summary: req.body.summary,
    description: req.body.description,
    slotId: req.body.slotId,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    userId: req.body.userId,
    timeZone: req.body.timeZone,
  });
  try {
    const { slotId, startDate, endDate } = req.body;
    const bookDates = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeZone: req.body.timeZone,
    };
    const newStartDate = new Date(bookDates.startDate).getTime();
    const newEndDate = new Date(bookDates.endDate).getTime();
    const currentTime = new Date().getTime();
    if (newStartDate < currentTime) {
      res.status(400).send("Slot can not be before current time");
      return;
    }
    if (newStartDate > newEndDate) {
      res.status(400).send("Start date should be less than end date");
      return;
    }
    const selectedSlot = await Slot.findById(slotId);
    let isDateTaken = false;
    let isSlotMatch = false;

    selectedSlot &&
      selectedSlot.bookDates.length > 0 &&
      selectedSlot?.bookDates.some((bookDate) => {
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
    if (selectedSlot) {
      duration = selectedSlot.duration;
      selectedSlot.slotTimes.find((slotTime) => {
        if (
          new Date(slotTime.date).toDateString() ===
          new Date(bookDates.startDate).toDateString()
        ) {
          const findSlotTime = slotTime?.spots?.find((spot) => {
            if (
              new Date(spot.startTime).getTime() ===
                new Date(bookDates.startDate).getTime() &&
              new Date(spot.endTime).getTime() ===
                new Date(bookDates.endDate).getTime()
            ) {
              return spot;
            }
          });
          console.log("findSlotTime", findSlotTime);
          if (findSlotTime) {
            isSlotMatch = true;
            return;
          }
        }
      });
    }

    if (isDateTaken) {
      res.status(400).send("Dates are taken");
      return;
    }

    if (!isSlotMatch) {
      res.status(400).send("StartDate and End Date's duration does not match");
      return;
    }

    // const slotEvent = new slotEvent(req.body);
    const result = await slotEvent.save();

    bookDates["eId"] = result._id;
    bookDates["isBooked"] = false;
    bookDates["userId"] = result.userId;

    // check if the dates are taken

    const slot = await Slot.findOneAndUpdate(
      { _id: slotId },
      {
        $push: { bookDates: bookDates },
      }
    );

    if (!slot) {
      res.status(404).send("Slot not found");
    } else {
      const sessionTime = new Date(Date.now() + 15 * 60 * 1000);
      console.log("\n\n result213213312 \n \n ", result);
      res.status(200).json({
        message: "Slot was updated successfully",
        status: "success",
        slotEvent: { ...result?._doc, sessionTime },
        slot: slot,
      });
      return;
    }
    res.send(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const deleteSlotEvent = async (req, res, next) => {
  try {
    const { id, slotId, userId } = req.body;

    const slotEvent = await SlotEvent.deleteOne({
      _id: id,
      userId: userId,
      slotId: slotId,
    });
    // const slotBasedInventoryEvent = await Slot.findOneAndUpdate(
    //   { _id: slotId },
    //   { $pull: { bookDates: { eId: id } } }
    // );
    const slotBasedInventoryEvent = await Slot.findOneAndUpdate(
      { _id: slotId },
      { $pull: { bookDates: { eId: id, userId: userId } } },
      { safe: true, multi: false }
    );

    console.log("slotEvent", slotEvent, slotBasedInventoryEvent);

    if (slotEvent && slotEvent.deletedCount === 1) {
      res.status(200).json({
        message: "slotEvent was deleted successfully",
        slotEventId: id,
      });
    } else {
      res.status(404).send(`slotEvent not found for the given id: ${id}`);
    }
  } catch (error) {
    next(error);
  }
};

const deleteSlotEventByCronJob = async (id, slotId) => {
  try {
    const slotEvent = await SlotEvent.deleteOne({
      _id: id,
    });

    const slot = await Slot.findOneAndUpdate(
      { _id: slotId },
      { $pull: { bookDates: { eId: id } } },
      { safe: true, multi: false }
    );

    if (slotEvent && slotEvent.deletedCount >= 1) {
      console.log("slotEvent", slotEvent, slot);
      return {
        message: "slotEvent was deleted successfully",
        slotEventId: id,
        slotId: slot._id,
      };
    } else {
      return `slotEvent not found for the given id: ${id}`;
    }
  } catch (error) {
    return error;
  }
};

const updateSessionTime = async (req, res, next) => {
  try {
    const { eId, userId, slotId } = req.body;
    currentTime = Date.now();

    const slotEvent = await SlotEvent.findOneAndUpdate(
      { _id: eId, userId: userId },
      { updatedAt: currentTime },
      { new: true }
    );

    console.log("updated slotEvent", slotEvent, currentTime);

    const sessionTime = new Date(currentTime + 15 * 60 * 1000);
    res.status(200).send({
      slotEvent: slotEvent,
      sessionTimeUpdated: sessionTime,
    });
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const bookTheSlotEvent = async (req, res, next) => {
  try {
    const { eId, userId } = req.body;
    let slotAlreadyBooked = false;
    const slotEvent = await SlotEvent.findOne({
      _id: eId,
      userId: userId,
    });
    console.log("slotEvent", slotEvent.isBooked);
    if (slotEvent.isBooked) {
      slotAlreadyBooked = true;
    }
    if (slotAlreadyBooked) {
      console.log("slotAlreadyBooked", slotAlreadyBooked);
      return res.status(400).send("Slot is already booked");
    }
    const bookSlotEvent = await SlotEvent.findOneAndUpdate(
      { _id: eId, userId: userId },
      { $set: { isBooked: true } },
      { new: true }
    );
    console.log("bookSlotEvent", bookSlotEvent);
    const slot = await Slot.findOneAndUpdate(
      { "bookDates.eId": eId },
      {
        $set: {
          "bookDates.$.isBooked": true,
        },
      },
      { new: true }
    );

    if (!slot || !bookSlotEvent) {
      res.status(404).send("Slot or Event not found");
    } else {
      res.status(200).json({
        message: "Slot and Event booked successfully",
        status: "success",
        slot: slot,
        event: bookSlotEvent,
      });
      return;
    }
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

module.exports = {
  createSlotEvent,
  getAllSlotEvents,
  deleteSlotEvent,
  deleteSlotEventByCronJob,
  updateSessionTime,
  bookTheSlotEvent,
};
