// Import des models Offer et User

const Offer = require("../models/Offer");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  //sans le next, la requête va rester "bloquée" dans ma fonction isAuthenticated
  //   next();
  console.log(req.headers.authorization);
  if (req.headers.authorization) {
    //je continue la suite de mes vérifications
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    }).select("account email _id");

    //POSTMAN => Bearer QSDFGH1234
    //BDD => QSDFGH1234
    if (user) {
      // Mon token est valide et je peux continuer
      //J'envoie les infos sur mon user à la suite de ma route
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: "Unautorized 2" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized 1" });
  }
};

module.exports = isAuthenticated;
