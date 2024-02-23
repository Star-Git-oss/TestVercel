const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const Vehicle = require("../../models/Vehicle");

const setCustomSuffix = (req, res, next) => {
  req.uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
  next();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    cb(null, "public/uploads/");
  },
  filename: async function (req, file, cb) {
    const uniqueSuffix = req.uniqueSuffix;
    const ext = path.extname(file.originalname);
    const index = req.files ? req.files.length + 1 : 1;
    cb(
      null,
      `${
        index === 2
          ? uniqueSuffix + ext
          : uniqueSuffix + "-" + (index - 2) + ext
      }`
    );
  },
  // uniqueSuffix: async function (req, file, cb) {
  //   req.suffix = req.uniqueSuffix;
  //   next();
  // }
});

const upload = multer({
  storage: storage,
});

router.post(
  "/upload",
  setCustomSuffix,
  upload.array("files"),
  async (req, res) => {
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
    const fileext = req.files[0].filename.slice(
      req.files[0].filename.indexOf(".")
    );
    let uploads = req.uniqueSuffix + fileext;
    console.log(uploads);
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
        uploads,
      });

      await vehicle.save();
      res.json(vehicle);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.post("/open", async (req, res) => {
  console.log(req.body);
  try {
    // const last12Documents = await Vehicle.find({
    //   $or: [
    //     { brand: { $regex: req.body.search, $options: "i" } },
    //     { price: { $regex: req.body.search, $options: "i" } },
    //     { version: { $regex: req.body.search, $options: "i" } },
    //     { payMethod: { $regex: req.body.search, $options: "i" } },
    //   ],
    // })
    //   .sort({ _id: -1 })
    //   .limit(req.body.num);
    let total = 0,
      count = 0;

    const totalDocuments = await Vehicle.find();
    total = totalDocuments.length;
    console.log(total);

    const searchResult = await Vehicle.find({
      $or: [
        { brand: { $regex: req.body.search, $options: "i" } },
        { price: { $regex: req.body.search, $options: "i" } },
        { version: { $regex: req.body.search, $options: "i" } },
        { payMethod: { $regex: req.body.search, $options: "i" } },
      ],
    }).sort({ _id: -1 });
    count = searchResult.length;
    console.log(count);

    res
      .status(200)
      .send({ data: searchResult, result: { total: total, count: count } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/groupOpen", async (req, res) => {
  let str = req.body.str;
  let newSrc = [];
  newSrc.push(str);
  console.log("str.slice(-17, -4)", str.slice(-17, -4));
  fs.readdir("public/uploads", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading images directory");
    } else {
      const imageNames = files.filter((file) =>
        file.includes(str.slice(-17, -4))
      ); // Filtrar solo archivos con extensión .jpg
      res.status(200).send(imageNames);
    }
  });
});

module.exports = router;
