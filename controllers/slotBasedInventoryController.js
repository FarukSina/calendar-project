const Calendar = require("../model/calendar");
const Slot = require("../model/slotBasedInventory");
const { getDaysInMonth } = require("../utils/utils");
const dayjs = require("dayjs");
//import dayjs from 'dayjs' // ES 2015
const getAllSlots = async (req, res) => {
  Slot.find({}, (err, slots) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(slots);
    }
  });
};

const getSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.query.id || req.body.id);
    res.status(200).json(slot);
  } catch (error) {
    next(error);
  }
};

const createSlot = async (req, res) => {
  console.log("req.body", req.body[0]);
  const { weeklyDays, duration2, timeZone, calendarId, slotNumber, slotName } =
    req.body;
  console.log(
    "req.body",
    weeklyDays,
    duration2,
    timeZone,
    calendarId,
    slotNumber,
    slotName
  );
  const duration = req.body.duration;
  const monthRange = 2;
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const allDatesInMonth = [];
  let days = [];
  const rules = [
    {
      type: "wday",
      wday: "sunday",
      intervals: [
        {
          from: "12:00",
          to: "18:00",
        },
      ],
    },
    {
      type: "wday",
      wday: "monday",
      intervals: [
        {
          from: "12:00",
          to: "18:00",
        },
      ],
    },
    {
      type: "wday",
      wday: "tuesday",
      intervals: [
        {
          from: "12:00",
          to: "20:00",
        },
      ],
    },
    {
      type: "wday",
      wday: "wednesday",
      intervals: [
        {
          from: "12:00",
          to: "18:00",
        },
      ],
    },
    {
      type: "wday",
      wday: "thursday",
      intervals: [
        {
          from: "12:00",
          to: "18:00",
        },
      ],
    },
    {
      type: "wday",
      wday: "friday",
      intervals: [
        {
          from: "12:00",
          to: "20:00",
        },
      ],
    },
    {
      type: "wday",
      wday: "saturday",
      intervals: [
        {
          from: "00:00",
          to: "23:45",
        },
      ],
    },
    {
      type: "date",
      intervals: [
        {
          from: "00:00",
          to: "23:00",
        },
      ],
      date: "2021-09-17",
    },
  ];

  for (let i = month; i < month + monthRange; i++) {
    console.log("i33", i, month, monthRange);
    let dates = getDaysInMonth(i, year);
    allDatesInMonth.push(...dates);
  }
  //   console.log("allDatesInMonth", allDatesInMonth);
  allDatesInMonth.forEach((date) => {
    const tempRule = rules.find(
      (rule) =>
        rule.wday ===
        date.toLocaleDateString("en-CA", { weekday: "long" }).toLowerCase()
    );
    if (tempRule) {
      const { from, to } = tempRule?.intervals[0];
      const tempFrom = from.split(":");
      const tempTo = to.split(":");
      const tempFromToMinutes =
        parseInt(tempFrom[0]) * 60 + parseInt(tempFrom[1]);
      const tempToMinutes = parseInt(tempTo[0]) * 60 + parseInt(tempTo[1]);
      const testDate = new Date(
        new Date(date).setHours(tempFrom[0], tempFrom[1], 0, 0)
      );
      console.log(
        "tempFromToMinutes,tempToMinutes",
        tempFromToMinutes,
        tempToMinutes,
        testDate
      );
      let spots = [];
      for (let i = tempFromToMinutes; i < tempToMinutes; i += duration) {
        const tempStartDate = new Date(date.setHours(0, 0, 0, 0));
        const tempEndDate = new Date(date.setHours(0, 0, 0, 0));
        console.log("tempStartDate", tempStartDate);
        tempStartDate.setMinutes(i);
        console.log("tempDate123", tempStartDate);
        spots.push({
          startTime: tempStartDate,
          endTime: new Date(tempEndDate.setMinutes(i + duration)),
        });
      }
      days.push({
        date: date,
        spots: spots,
      });
    }
  });

  //   res.status(200).json({ ...days });
  try {
    const ifCalendarAvailable = await Calendar.findById(req.body.calendarId);
    console.log("ifCalendarAvailable", ifCalendarAvailable);
    if (ifCalendarAvailable) {
      const body = {
        ...req.body,
        calendarId: req.body.calendarId,
        slotTimes: days,
      };
      const slot = new Slot(body);
      const result = await slot.save();
      res.send(result);
      if (result) {
        const addSlotIdToCalendar = await Calendar.findByIdAndUpdate(
          req.body.calendarId,
          { $push: { slotBasedInventoryIds: result._id } },
          { new: true, useFindAndModify: false }
        );
        console.log("addSlotIdToCalendar", addSlotIdToCalendar);
      }
    } else {
      res.status(404).send("Error Calendar Id not found");
    }
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateSlot = async (req, res, next) => {
  try {
    const { id, timeZone } = req.body;
    // const bookDates = {
    //   startDate: new Date(dates.startDate),
    //   endDate: new Date(dates.endDate),
    // };

    // check if the dates are taken
    // const selectedRoom = await Slot.findById(id);
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
    const slot = await Slot.findOneAndUpdate({ _id: id }, { timeZone });

    if (!slot) {
      res.status(404).send("Slot not found");
    } else {
      res.status(200).json({
        message: "Slot was updated successfully",
        status: "success",
        slot: req.body,
      });
    }
    // }
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const { id } = req.query;
    const slot = await Slot.deleteOne({ _id: id });
    console.log("slot", slot, id);
    res.status(200).json({ message: "Slot was deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const freeBusySlot = async (req, res, next) => {
  try {
    const { id } = req.query;
    const result = await Slot.findById(id);
    console.log("result", result);
    if (result !== null && result.bookDates && result.bookDates.length > 0) {
      const dates = result.bookDates.map((bookDate) => {
        return {
          startDate: bookDate.startDate,
          endDate: bookDate.endDate,
        };
      });
      console.log("dates33", dates);

      const filteredResults = result.slotTimes.map((day) => {
        day.spots = day.spots.filter((spot) => {
          return !dates.some((date) => {
            return (
              date.startDate.getTime() === spot.startTime.getTime() &&
              date.endDate.getTime() === spot.endTime.getTime()
            );
          });
        });

        return day;
      });

      const reducedResults = filteredResults.reduce((acc, curr) => {
        const newDate = dayjs(curr.date).format("YYYY-MM-DD");
        if (curr.spots.length > 0) {
          acc[newDate] = curr.spots;
        }
        return acc;
      }, []);
      console.log("reducedResults", reducedResults);
      res.status(200).json({ ...reducedResults, duration: result.duration });
    } else {
      const reducedSlotTimes = result.slotTimes.reduce((acc, curr) => {
        const newDate = dayjs(curr.date).format("YYYY-MM-DD");
        if (curr.spots.length > 0) {
          acc[newDate] = curr.spots;
        }
        return acc;
      }, []);
      console.log("reducedSlotTimes", reducedSlotTimes);
      res.status(200).json({ ...reducedSlotTimes, duration: result.duration });
    }
  } catch (error) {
    next(error);
  }
};

const getAllSlotsByCalendar = async (req, res, next) => {
  try {
    const { calendarId } = req.query;
    const slots = await Slot.find({
      calendarId: calendarId,
    });
    res.send(slots);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getAllAvailableDatesBySlots = async (req, res, next) => {
  const { startDate, endDate } = req.body;

  try {
    const slots = await Slot.find({});

    console.log("slots", slots);
    const newStartDate = new Date(startDate).getTime();
    const newEndDate = new Date(endDate).getTime();
    let availableRooms = [];
    slots &&
      slots.length > 0 &&
      slots.forEach((slot) => {
        if (slot.bookDates.length > 0) {
          const isBooked = slot.bookDates.some((bookDate) => {
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
            availableRooms.push(slot);
          }
        } else {
          availableRooms.push(slot);
        }
      });
    res.send(availableRooms);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const getAllAvailableSlotsByDateFunc = async (
  calendarId,
  startDate,
  endDate
) => {
  try {
    const slots = await Slot.find({
      calendarId: calendarId,
    });
    console.log("slots", slots);
    const newStartDate = new Date(startDate).getTime();
    const newEndDate = new Date(endDate).getTime();
    let availableRooms = [];
    slots &&
      slots.length > 0 &&
      slots.forEach((slot) => {
        if (slot.bookDates.length > 0) {
          const isBooked = slot.bookDates.some((bookDate) => {
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
            availableRooms.push(slot);
          }
        } else {
          availableRooms.push(slot);
        }
      });
    return availableRooms;
  } catch (error) {
    return { message: error.message };
  }
};

const getAllAvailableSlotsByDate = async (req, res, next) => {
  try {
    const { calendarId, slotId, startDate, endDate } = req.body;
    const getAllSlots = await Slot.findById({
      _id: slotId,
      calendarId: calendarId,
    });
    console.log("body", req.body);
    console.log("getAllSlots", getAllSlots);
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    const tempDates =
      getAllSlots &&
      getAllSlots.slotTimes.filter((slot) => {
        console.log(
          "slot condition",
          startDate,
          newStartDate,
          endDate,
          newEndDate
        );
        if (
          new Date(slot.date) <= newEndDate &&
          new Date(slot.date) >= newStartDate
        ) {
          return slot;
        } else {
          return;
        }
      });
    console.log("tempDates", tempDates);
    res.send(tempDates);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

module.exports = {
  getAllSlots,
  getSlot,
  createSlot,
  updateSlot,
  deleteSlot,
  freeBusySlot,
  getAllSlotsByCalendar,
  getAllAvailableDatesBySlots,
  getAllAvailableSlotsByDateFunc,
  getAllAvailableSlotsByDate,
};
