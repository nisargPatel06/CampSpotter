const mongoose = require("mongoose");
const Reviews = require("./reviews");
const Users = require("./user");
const Schema = mongoose.Schema; //Creates Mongoose's Schema constructor.


const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  reviews: [
      {
          type: Schema.Types.ObjectId,
          ref: 'Review'
      }
  ]
});


CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Reviews.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});
//generate the collection name as "campgrounds" and export
module.exports = mongoose.model("Campground", CampgroundSchema);
