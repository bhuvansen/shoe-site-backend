require("dotenv").config();
const express = require("express")
const app = express()
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/order");
const stripeRoutes = require("./routes/stripepayment");
const orderStripe = require("./routes/orderStripe");


mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("DB CONNECTED");
  }).catch((err=>console.log("err", err)));

app.get("/", (req, res) => {
  res.send("GET request to the homepage")
})

//MIDDLEWARE
// app.use("/api/stripe", orderStripe);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api/stripe", stripeRoutes);

const port = 8000

app.listen(port, () => {
  console.log("listen on port 8000")
})
