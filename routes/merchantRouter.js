const express = require("express");
const router = express.Router();
const {
  getAllMerchants,
  getMerchant,
  createMerchant,
  updateMerchant,
  deleteMerchant,
} = require("../controllers/merchantController");

router.route("/getAllMerchants").get(getAllMerchants);
router.route("/getMerchant").get(getMerchant);
router.route("/createMerchant").post(createMerchant);
router.route("/updateMerchant").post(updateMerchant);
router.route("/deleteMerchant").post(deleteMerchant);

module.exports = router;
