const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.route("/getAllUsers").get(getAllUsers);
router.route("/getUser").get(getUser);
router.route("/createUser").post(createUser);
router.route("/updateUser").post(updateUser);
router.route("/deleteUser").post(deleteUser);

module.exports = router;
