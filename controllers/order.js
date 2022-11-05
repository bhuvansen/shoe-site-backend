const { Order, ProductCart } = require("../models/order");

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No Order found in DB",
        });
      }
      req.order = order;
      next();
    });
};

exports.createOrder = (req, res) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;

  console.log("formattedToday", formattedToday)
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to save your order in DB",
      });
    }
    res.json(order);
  });
  };
  
  exports.getAllOrders = (req, res) => {
    Order.find()
      .exec((err, order) => {
        if (err) {
          return res.status(400).json({
            error: "No order found in DB",
          });
        }
        res.json(order);
      });
  };

  exports.getAllOrdersById = (req, res) => {
    Order.find()
      .populate("user", "_id name ")
      .exec((err, order) => {
        if (err) {
          return res.status(400).json({
            error: "No order found in DB",
          });
        }
        res.json(order);
      });
  };
  
  exports.getOrderStatus = (req, res) => {
    res.json(Order.schema.path("status").enumValues);
  };

  exports.updateStatus = (req, res) => {
    Order.findOneAndUpdate(
      { _id: req.body.getOrderById },
      { $set: { status: req.body.status } },
      (err, order) => {
        if (err) {
          return res.status(400).json({
            error: "Cannot update order status",
          });
        }
        res.json(order);
      }
    );
  };
  