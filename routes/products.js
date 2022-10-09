var express = require("express");
var router = express.Router();

const {
    getProductById,
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    getAllUniqueCategories,
    photo
  } = require("../controllers/products");
  const { isSignedIn, isAdmin, isAuthenticated } = require("../controllers/auth");
  const { getUserById } = require("../controllers/user");
  

router.param("userId", getUserById)
router.param("productId", getProductById)


router.post("/product/create/:userId", isSignedIn, isAuthenticated, isAdmin, createProduct)
router.get("/product/photo/:productId", photo);



router.get("/product/:productId", getProduct)
router.get("/products", getAllProduct)


router.put("/product/:productId/:userId",  isSignedIn, isAuthenticated, isAdmin, updateProduct)
router.delete("/product/:productId/:userId",  isSignedIn, isAuthenticated, isAdmin, deleteProduct)

router.get("/products/catogories", getAllUniqueCategories)

module.exports = router;
