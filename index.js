require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const formidableMiddleware = require("express-formidable");
app.use(formidableMiddleware());

const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

//Connexion à la BDD
mongoose.connect(process.env.MONGODB_URI);

// Paramétrage de cloudinary, ajout des credentials

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import des routes User et offers

const userRoutes = require("./routes/users");
app.use(userRoutes);

const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json("Page not found");
});

app.listen(process.env.PORT, () => {
  console.log("Server started 👌 on port : " + process.env.PORT);
});

// app.listen(3000, () => {
//   console.log("Server started 👌");
// });
