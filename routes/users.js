const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

// Import des models

const Offer = require("../models/Offer");
const User = require("../models/User");

// Route Signup

router.post("/user/signup", async (req, res) => {
  //  console.log(req.fields);
  //  res.json("Test ok");
  try {
    if (req.fields.username) {
      const emailCheck = await User.findOne({ email: req.fields.email });
      const password = req.fields.password;
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(16);
      if (!emailCheck) {
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });

        await newUser.save();
        // Technique 01 : utilisation du select
        const result = await User.findOne({ email: req.fields.email }).select(
          "_id account token"
        );

        //Technique 02 : sans select

        // const result = {
        //   id: newUser._id,
        //   account: newUser.account,
        //   token: newUser.≈x
        res.json(result);
      } else {
        res.status(400).json({ message: "email already exist" });
      }
    } else {
      res.status(400).json({ message: "username is required!" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// Route Login

//Déclaré ma route Login
router.post("/user/login", async (req, res) => {
  //   console.log(req.fields);

  try {
    // Vérifié si email existe ou pas
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      const password = req.fields.password;
      const hash = SHA256(password + user.salt).toString(encBase64);
      if (user.hash !== hash) {
        res.status(401).json("incorrect password");
      } else {
        const result = await User.findOne({ email: req.fields.email }).select(
          "_id account token"
        );
        res.json(result);
      }
    } else {
      res.status(401).json("Wrong credentials 💩");
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
