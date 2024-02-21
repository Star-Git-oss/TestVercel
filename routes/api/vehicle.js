const express = require("express");
const multer = require("multer");
const path = require('path');
const router = express.Router();
const Vehicle = require("../../models/Vehicle");

const setCustomSuffix = (req, res, next) => {
  req.uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
  next();
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    cb(null, "public/uploads/");
  },
  filename: async function (req, file, cb) {
    const uniqueSuffix = req.uniqueSuffix;
    const ext = path.extname(file.originalname);
    const index = req.files ? req.files.length + 1 : 1;
    cb(null, `${ index === 2 ? uniqueSuffix+ext : uniqueSuffix + "-" + (index-2) + ext}`);
  },
  // uniqueSuffix: async function (req, file, cb) {
  //   req.suffix = req.uniqueSuffix;
  //   next();
  // }
});

const upload = multer({
  storage: storage,
});

router.post("/upload", setCustomSuffix, upload.array("files"), async (req, res) => {
  const {
    id,
    brand,
    year,
    version,
    mileage,
    transmission,
    whatsApp,
    price,
    payMethod,
    vehicleInfo,
  } = req.body;
  try {
    let vehicle = new Vehicle({
      id,
      brand,
      year,
      version,
      mileage,
      transmission,
      whatsApp,
      price,
      payMethod,
      vehicleInfo,
      uploads: req.uniqueSuffix,
    });

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
