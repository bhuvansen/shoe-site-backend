const express = require("express");
const router = express.Router();

const { makepayment, retrievePayment, getSessionId } = require("../controllers/stripepayment");
router.param("sessionId", getSessionId)

router.post("/create-checkout-session", makepayment);
router.get("/order/success/:sessionId", retrievePayment);



module.exports = router;
