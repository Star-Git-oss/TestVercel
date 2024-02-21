const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    year: {
      type: String,
    },
    version: {
      type: String,
    },
    mileage: {
      type: String,
    },
    transmission: {
      type: String,
    },
    whatsapp: {
      type: String,
    },
    price: {
      type: String,
    },
    payMethod: {
      type: String,
    },
    vehicleInfo: {
      type: String,
    },
    uploads: {
      type: Array,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("vehicle", UserSchema);
