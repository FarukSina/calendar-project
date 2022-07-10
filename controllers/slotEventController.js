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
              isSlotMatch = false;
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
      let multipleSlotEvents = Object.keys(slotEvents).reduce(
        async (a, key) => {
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
              .then(async (slot) => {
                const lastSlot = await a;
                console.log("lastSlot", lastSlot);
                return {
                  ...lastSlot,
                  [key]: {
                    id: _result.slotId,
                    message: "Slot and Slot Event updated successfully",
                    status: "success",
                    slotEvent: { ..._result?._doc },
                    slot: slot,
                  },
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
        },
        Promise.resolve()
      );
      return multipleSlotEvents;
    };

    if (slotEvents && Object.keys(slotEvents).length > 0) {
      const slotResults = await asyncFunction();
      console.log("slotResults123", slotResults);
      if (!slotResults || Object.keys(slotResults).length === 0) {
        res.status(404).json({
          message: "Slot and Slot Event not updated",
          status: "failure",
        });
      } else {
        const sessionTime = new Date(Date.now() + 15 * 60 * 1000);
        res.status(200).json({
          ...slotResults,
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
    const { eventList } = req.body;
    console.log("eventList1", eventList, req.body);
    currentTime = Date.now();

    const asyncFunction = async () => {
      let multipleSlotEvents = Object.keys(eventList).reduce(async (a, key) => {
        return a
          .then(async () => {
            const slot = eventList[key].slotEvent;
            const { _id, userId } = slot;
            console.log("Update Session Time Slot Event", _id, userId);
            return SlotEvent.findOneAndUpdate(
              { _id: slot._id, userId: slot.userId },
              { updatedAt: currentTime },
              { new: true }
            );
          })
          .then(async (slot) => {
            const lastSlot = await a;
            console.log("lastSlot222", lastSlot);
            return {
              ...lastSlot,
              [key]: slot,
            };
          });
      }, Promise.resolve());
      return multipleSlotEvents;
    };

    if (eventList && Object.keys(eventList).length > 0) {
      const updatedEventResults = await asyncFunction();
      console.log("updatedEventResults", updatedEventResults);
      if (
        !updatedEventResults ||
        Object.keys(updatedEventResults).length === 0
      ) {
        res.status(404).json({
          message: "Slot and Slot Event not updated",
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

const bookMultipleSlotEvents = async (req, res, next) => {
  try {
    const { eventList, userId } = req.body;
    let slotAlreadyBooked = {};
    console.log("eventList", eventList, userId);
    const asyncFunction = async () => {
      let multipleSlotEvents = Object.keys(eventList).reduce(async (a, key) => {
        return a.then(async () => {
          let _result = null;
          let slotAlreadyBooked = {};

          return await SlotEvent.findOneAndUpdate(
            { _id: eventList?.[key]?.slotEvent?._id, userId: userId },
            { $set: { isBooked: true } }
          )
            .then(async (result) => {
              const slotEvent = await SlotEvent.findOne({
                _id: eventList?.[key]?.slotEvent?._id,
                userId: userId,
              });
              console.log("slotEvent123", slotEvent, slotEvent.isBooked);
              if (slotEvent.isBooked) {
                slotAlreadyBooked = {
                  ...slotAlreadyBooked,
                  [key]: {
                    isBooked: true,
                    ...slotEvent?._doc,
                  },
                };
                return result;
              }
              return await result;
            })
            .then((result) => {
              _result = result;
              return Slot.findOneAndUpdate(
                { "bookDates.eId": eventList?.[key]?.slotEvent?._id },
                {
                  $set: {
                    "bookDates.$.isBooked": true,
                  },
                },
                { multi: true }
              );
            })
            .then(async (slot) => {
              const lastSlod = await a;
              console.log("lastSlod", lastSlod);
              return {
                ...lastSlod,
                [key]: {
                  id: _result.slotId,
                  message: "Slot and Slot Event updated successfully",
                  status: "success",
                  slotEvent: { ..._result?._doc },
                  slot: slot,
                },
                slotAlreadyBooked,
                alreadyBookedSlotsLength:
                  Object.keys(slotAlreadyBooked)?.length,
              };
            });
        });
      }, Promise.resolve());
      return multipleSlotEvents;
    };

    if (Object.keys(eventList).length === 0) {
      return res.status(400).send("No events to book");
    }

    const result = await asyncFunction();

    if (
      result &&
      result?.slotAlreadyBooked &&
      Object.keys(result?.slotAlreadyBooked)?.length ===
        Object.keys(eventList)?.length
    ) {
      console.log("slotAlreadyBooked", slotAlreadyBooked);
      return res.status(400).json({
        message: "The Slot is already booked",
        slotAlreadyBooked: result?.slotAlreadyBooked,
      });
    }

    console.log("result", result);

    if (!result || Object.keys(result)?.length === 0) {
      res.status(404).send("Slot or Event not found");
    } else {
      res.status(200).json({
        message: "Slot and Event booked successfully",
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
  bookMultipleSlotEvents,
};
