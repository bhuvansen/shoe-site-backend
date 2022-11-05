var mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema;

const ProductCardSchema = new Schema({
  product: {
    type: ObjectId,
    ref: "Product",
  },
  name: String,
  count: Number,
  price: Number,
  size: Number,
  quantity: Number,
  status: {
    type: String,
    default: "Received",
    enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Received"],
  },
});

const ProductCart = mongoose.model("ProductCart", ProductCardSchema);

const orderSchema = new Schema(
  {
    products: [ProductCardSchema],
    transaction_id: {},
    amount: { type: Number },
    address: String,
    payment: {
      type: String,
      default: "Paid",
      enum: ["COD", "Paid"],
    },
    status: {
      type: String,
      default: "Received",
      enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Received"],
    },
    updated: Date,
    user: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Oder", orderSchema);
module.exports = { Order, ProductCart };
