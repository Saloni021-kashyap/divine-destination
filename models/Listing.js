const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({

title:{
type:String,
required:true,
trim:true
},

location:{
type:String,
required:true,
trim:true
},

price:{
type:Number,
required:true,
min:0
},

description:{
type:String,
trim:true,
default:""
},

// Travel Mode (Bus / Train / Flight)

travelMode:{
type:String,
enum:["Bus","Train","Flight"],
default:"Train"
},

images: {
  type: [
    {
      url: { type: String, required: true, default: "https://via.placeholder.com/400x250" },
      filename: { type: String, required: false, default: "placeholder.jpg" }
    }
  ],
  default: [{ url: "https://via.placeholder.com/400x250", filename: "placeholder.jpg" }]
},

totalSeats: {
  type: Number,
  default: 40,
  min: 1
},

availableSeats: {
type:Number,
default:40,
min:0
}

},{timestamps:true});

module.exports = mongoose.model("Listing", listingSchema);
