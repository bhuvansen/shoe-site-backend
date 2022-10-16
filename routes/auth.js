// const { Router } = require("express");
var express = require("express");
var router = express.Router();
const {  signup, signin, signout, isSignedIn, isAuthenticated } = require("../controllers/auth");
const { check } = require("express-validator");

router.post('/signup', 
check("firstName", "Name should be atleast 3 characters long").isLength({min:3}),
check("email", "Please enter a valid email").isLength({min:3}),
check("password", "Password should be atleast 6 characters long").isLength({min:6}),
check("password", "Password should be combination of Uppercase, lowercase, digits and special characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^\&*\)\(+=._-])[!-~]{6,}$/),
signup)

router.post('/signin', 
check("email", "Email is required").isLength({min:3}),
check("password", "Password is required").isLength({min:0}),
signin
)

router.get("/signout", signout);



module.exports = router;
