const Merchant = require("../model/merchant");

// Merchant Endpoints

const getAllMerchants = async (req, res) => {
  Merchant.find({}, (err, hotels) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(hotels);
    }
  });
};

const getMerchant = async (req, res, next) => {
  try {
    const merchant = await Merchant.findById(req.query.id || req.body.id);
    res.status(200).json(merchant);
  } catch (error) {
    next(error);
  }
};

const createMerchant = async (req, res) => {
  const merchant = new Merchant(req.body);
  try {
    const result = await merchant.save();
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateMerchant = async (req, res, next) => {
  try {
    const { id, merchantName } = req.body;

    const merchant = await Merchant.findOneAndUpdate(
      { _id: id },
      {
        merchantName,
      }
    );
    console.log("merchant", merchant, merchantName, id);
    if (merchant && merchantName !== "") {
      res.status(200).json({
        message: "Merchant was updated successfully",
        status: "success",
        merchant: req.body,
      });
    } else {
      res.status(404).send("Merchant not found");
    }
  } catch (error) {
    next(error);
  }
};

const deleteMerchant = async (req, res, next) => {
  try {
    const { id } = req.query;
    const merchant = await Merchant.deleteOne({ _id: id });
    console.log("merchant", merchant, id);
    if (merchant && merchant.deletedCount === 1) {
      res.status(200).json({
        message: "Merchant was deleted successfully",
        status: "success",
        merchant: req.body,
      });
    } else {
      res.status(404).send("Merchant not found");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMerchants,
  getMerchant,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};
