const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

// Import des models Offer et User

const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");

// Paramétrage de cloudinary, ajout des credentials

cloudinary.config({
  cloud_name: "user-afterall",
  api_key: 871588584552192,
  api_secret: "cZFYSTHeUlqmCphCcKnUccxg0DE",
});

// Route Publish
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //   console.log(Object.keys(req.files));
  //   console.log(req.files);
  console.log(req.user);

  //   console.log(req.files.picture.path);

  try {
    newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
    });

    // J'ajoute mon owner que je récupère grace à ma collection User
    newOffer.owner = req.user;

    const result = await cloudinary.uploader.upload(req.files.picture.path);
    // console.log(result);
    newOffer.product_image = result;

    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route offers
router.get("/offers", async (req, res) => {
  // console.log(req.fields);

  const filters = {};

  if (req.query.title) {
    filters.product_name = new RegExp(req.query.title, "i");
  }
  if (req.query.priceMax) {
    filters.product_price = { $lte: Number(req.query.priceMax) };
  }
  if (req.query.priceMin) {
    filters.product_price = { $gte: Number(req.query.priceMin) };
  }
  if (req.query.priceMax && req.query.priceMin) {
    filters.product_price = {
      $lte: Number(req.query.priceMax),
      $gte: Number(req.query.priceMin),
    };
  }

  // const sort = "";
  console.log(req.query.sort);
  if (req.query.sort) {
    req.query.sort = req.query.sort.replace("price-", "");
  } else {
    req.query.sort = "";
  }

  const limit = 3;
  if (!req.query.page) {
    req.query.page = 1;
  }

  try {
    const offers = await Offer.find(filters)
      .limit(limit)
      .skip((req.query.page - 1) * limit)
      .sort({ product_price: req.query.sort })
      .select("product_name product_price");
    res.json(offers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
