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
const getSlotEvent = async (req, res, next) => {
  const { id } = req.query;
  try {
    const slot = await SlotEvent.find({ _id: id });
    res.status(200).json(slot);
  } catch (error) {
    next(error);
  }
};

const createSlotEvent = async (req, res, next) => {
  let slotEvents = {};
  const slotEvent = new SlotEvent({
    summary: req.body.summary,
    description: req.body.description,
    slotId: req.body.slotId,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    userId: req.body.userId,
    timeZone: req.body.timeZone,
  });
  const slotEvent2 = new SlotEvent({
    summary: req.body.summary,
    description: req.body.description,
    slotId: req.body.slotId,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    userId: req.body.userId,
    timeZone: req.body.timeZone,
  });
  slotEvents["slotEvent"] = slotEvent;
  slotEvents["slotEvent2"] = slotEvent2;
  console.log("slotEvent Object 2 Multiple Slots", slotEvents);
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
      res.status(404).send("Slot not found222");
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

const createMultipleSlotEvent = async (req, res, next) => {
  const slotEvents = {};
  const { quantity, slotIds } = req.body;
  if (quantity >= 1) {
    for (let i = 0; i < quantity; i++) {
      let tempSlotEvent = new SlotEvent({
        summary: req.body.summary,
        description: req.body.description,
        slotId: slotIds[i],
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        userId: req.body.userId,
        timeZone: req.body.timeZone,
        personName: req.body.userList[`user${i + 1}`],
      });
      slotEvents[`slotEvent${i + 1}`] = tempSlotEvent;
    }
  }
  console.log("slotEvents", slotEvents);
  try {
    const { timeZone, startDate, endDate } = req.body;
    const bookDates = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeZone: timeZone,
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
    let selectedSlots = {};
    if (slotEvents && Object.keys(slotEvents).length > 0) {
      selectedSlots = await Slot.find({ _id: { $in: slotIds } });
    }
    console.log("selectedSlots", selectedSlots);
    let isDateTaken = false;
    let isSlotMatch = false;

    if (selectedSlots && Object.keys(selectedSlots).length > 0) {
      selectedSlots.forEach((slot) => {
        slot &&
          slot.bookDates.length > 0 &&
          slot?.bookDates.some((bookDate) => {
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
        if (slot) {
          duration = slot.duration;
          slot.slotTimes.find((slotTime) => {
            if (
              new Date(slotTime.date).toDateString() ===
              new Date(bookDates.startDate).toDateString()
            ) {
              const findSlotTime = slotTime?.spots?.find((spot) => {
                console.log(
                  "asdsadasdas",
                  new Date(spot.startTime),
                  new Date(bookDates.startDate),
                  new Date(spot.startTime).getTime() ===
                    new Date(bookDates.startDate).getTime()
                );
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

    const asyncFunction = async () => {
      console.log("faruk123", slotEvents);

      let asd = Object.keys(slotEvents).reduce(async (a, key) => {
        return a.then(async () => {
          let _result = null;
          return slotEvents[key]
            .save()
            .then((result) => {
              _result = result;
              bookDates["eId"] = result._id;
              bookDates["isBooked"] = false;
              bookDates["userId"] = result.userId;

              return Slot.findOneAndUpdate(
                { _id: result.slotId },
                {
                  $push: { bookDates: bookDates },
                }
              );
            })
            .then((slot) => {
              return {
                id: _result.slotId,
                message: "Slot and Slot Event updated successfully",
                status: "success",
                slotEvent: { ..._result?._doc },
                slot: slot,
              };
            });
        });

        // const result = await slotEvents[key].save();
        // console.log("result12", result);
        // bookDates["eId"] = result._id;
        // bookDates["isBooked"] = false;
        // bookDates["userId"] = result.userId;
        // const slot = await Slot.findOneAndUpdate(
        //   { _id: slotId },
        //   {
        //     $push: { bookDates: bookDates },
        //   }
        // );
        // console.log("result123", slot);
        // if (result && slot) {
        //   results.push({
        //     message: "Slot and Slot Event updated successfully",
        //     status: "success",
        //     slotEvent: { ...result?._doc },
        //     slot: slot,
        //   });
        //   console.log("results1234", results);
        // }
      }, Promise.resolve());

      return asd;
    };

    if (slotEvents && Object.keys(slotEvents).length > 0) {
      const slotResults = await asyncFunction();
      console.log("slotResultsFARUK123", slotResults);
      if (!slotResults || Object.keys(slotResults).length === 0) {
        console.log("slotResults Error", slotResults);
        res.status(404).send("Slot not found");
      } else {
        const sessionTime = new Date(Date.now() + 15 * 60 * 1000);
        console.log("slotResults", slotResults);
        res.status(200).json({
          ...slotResults,
          sessionTime,
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
    const { eId, userId } = req.body;
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

const updateMultipleSessionTime = async (req, res, next) => {
  try {
    let slotEvents = [];
    const { userId, eventsList } = req.body;
    currentTime = Date.now();
    if (eventsList && eventsList.length > 0) {
      for (let i = 0; i < eventsList.length; i++) {
        const slotEvent = await SlotEvent.findOneAndUpdate(
          { _id: eventsList[i].eId, userId: userId },
          { updatedAt: currentTime },
          { new: true }
        );
        slotEvents.push({ ...slotEvent });
        console.log("updated slotEvent", slotEvent, currentTime);
      }
    }

    const sessionTime = new Date(currentTime + 15 * 60 * 1000);
    res.status(200).send({
      slotEvents: { ...slotEvents },
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
  createMultipleSlotEvent,
  getAllSlotEvents,
  getSlotEvent,
  deleteSlotEvent,
  deleteSlotEventByCronJob,
  updateSessionTime,
  bookTheSlotEvent,
  updateMultipleSessionTime,
};
