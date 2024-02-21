const express = require("express");
const multer = require("multer");
const router = express.Router();
const Vehicle = require("../../models/Vehicle");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      // Specify the directory where uploaded files will be stored
      cb(null, 'public/uploads/');
  },
  filename: async function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalExtension = file.originalname.split('.').pop();
      const newFileName = file.fieldname + '-' + uniqueSuffix + '.' + originalExtension;
      cb(null, newFileName);
  }
});

const upload = multer({
  storage: storage
});

router.post("/upload", upload.array('files'), async (req, res) => {
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
    vehicleInfo
  } = req.body;
  try {

    const files = req.files;
    const uploads = [];
    for(let i = 0; i < files.length; i++){
      uploads.push(files[i].filename);
    }

    console.log(uploads);

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
      uploads
    });

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


module.exports = router;
