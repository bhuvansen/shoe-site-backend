var mongoose = require("mongoose")
const { Schema } = mongoose
const { ObjectId } = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32,
  },
  description: {
    type: String,
    required: false,
    maxLength: 150,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  quantity: {
      type:Schema.Types.Mixed
    // default:

      // required:true,
      // default:[{
      //   size: {type: Number, required:true},
      //   quantity: {type: Number, required:true} 
      // }]
  },
  stock: {
    type: Number,
  },
  sold: {
    type:Schema.Types.Mixed
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
  category: {
    type: ObjectId,
    ref: "Category",
    required: true,
  },
},{timestamps:true})
module.exports = mongoose.model("Product", productSchema)
