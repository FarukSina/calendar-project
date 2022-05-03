const User = require("../model/user");

const getAllUsers = async (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(users);
    }
  });
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.query.id || req.body.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const result = await user.save();
    res.send(result);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id, userName } = req.body;

    const user = await User.findOneAndUpdate(id, {
      userName,
    });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).json({
        message: "User was updated successfully",
        status: "success",
        user: req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = await User.deleteOne({ _id: id });
    console.log("user", user, id);
    res.status(200).json({ message: "User was deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
