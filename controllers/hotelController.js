const Hotel = require("../model/hotel");

// Hotel Endpoints

const getAllHotels = async (req, res) => {
  Hotel.find({}, (err, hotels) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(hotels);
    }
  });
};

const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.query.id || req.body.id);
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

const createHotel = async (req, res) => {
  const hotel = new Hotel(req.body);
  try {
    const result = await hotel.save();
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateHotel = async (req, res, next) => {
  try {
    const { id, hotelName } = req.body;

    const hotel = await Hotel.findOneAndUpdate(
      { _id: id },
      {
        hotelName,
      }
    );
    console.log("hotel", hotel, hotelName, id);
    if (hotel && hotelName !== "") {
      res.status(200).json({
        message: "Hotel was updated successfully",
        status: "success",
        hotel: req.body,
      });
    } else {
      res.status(404).send("Hotel not found");
    }
  } catch (error) {
    next(error);
  }
};

const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.query;
    const hotel = await Hotel.deleteOne({ _id: id });
    console.log("hotel", hotel, id);
    if (hotel && hotel.deletedCount === 1) {
      res.status(200).json({
        message: "Hotel was deleted successfully",
        status: "success",
        hotel: req.body,
      });
    } else {
      res.status(404).send("Hotel not found");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
};
