var express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getProductById } = require("../controllers/products");
const { getUserById, getSize, getUser, updateUser, userPurchaseList, userOrderList, pushOrderInCartList, userCartList, deleteItemFromCart, updateCart } = require("../controllers/user");
var router = express.Router();

router.param("productId", getProductById)
router.param("userId", getUserById)
router.param("size", getSize)

router.get("/user/:userId", isSignedIn, isAuthenticated, getUser)
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser)
router.get("/user/:userId/purchases", isSignedIn, isAuthenticated, userPurchaseList)
router.put("/user/:userId/cart", isSignedIn, isAuthenticated, pushOrderInCartList)
router.delete("/user/:userId/cart/:productId/:size", isSignedIn, isAuthenticated, deleteItemFromCart)
router.put("/user/:userId/cart/update", isSignedIn, isAuthenticated, updateCart)
router.get("/user/:userId/cart", isSignedIn, isAuthenticated, userCartList)

router.get("/testroute", isSignedIn, (req, res) => {
    res.json(req.auth);
  });

module.exports = router;
