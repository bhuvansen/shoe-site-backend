var express = require("express");
var router = express.Router();

const { isSignedIn, isAdmin, isAuthenticated } = require("../controllers/auth");
const { getUserById, pushOrderInPurchaseList } = require("../controllers/user");
const { updateStock, getAllProducts } = require("../controllers/products");

const {
  getOrderById,
  createOrder,
  getAllOrdersById,
  getOrderStatus,
  updateStatus,
  getAllOrders,
} = require("../controllers/order");

router.param("userId", getUserById);
router.param("orerId", getOrderById);

router.post("/order/updateStock/:userId", isSignedIn, isAuthenticated, updateStock);
router.post("/order/create/:userId", isSignedIn, isAuthenticated, pushOrderInPurchaseList, createOrder);

router.get("/orders/:userId",isSignedIn,isAuthenticated,isAdmin,getAllOrders);
router.get("/order/all/:userId",isSignedIn,isAuthenticated,isAdmin,getAllOrdersById);

router.get("/order/status/:userId",isSignedIn,isAuthenticated,isAdmin,getOrderStatus);
router.put("/order/:orderId/status/userId",isSignedIn,isAuthenticated,isAdmin,updateStatus);
module.exports = router;
