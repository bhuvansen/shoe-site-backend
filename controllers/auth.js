require("dotenv").config();
const User = require("../models/user")
const { validationResult } = require("express-validator")
const bcrypt = require('bcrypt');
var jwt = require("jsonwebtoken");
// var expressJwt = require("express-jwt");
var { expressjwt: expressJwt } = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors
    })
  }

  User.findOne({ email: req.body.email }, (err, userExist) => {
    if (userExist) {
      return res.status(422).json({
        error: "User email exists",
      })
    }
    if (err) {
      return res.status(422).json({
        error: "Unable to create customer. Please try again later",
      })
    }
    console.log("req", req.body)
    const user = new User(req.body)
    user.save((err, user) => {
      if (err) {
        return res.status(400).json({
          error: `NOT able to save user in DB ${err}`,
        })
      } else {
        return res.status(200).json({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          id: user._id,
        })
      }
    })
  })
}

exports.signin = (req, res) => {
  const { email, password } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors,
    })
  }
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User email does not exists",
      })
    }
    bcrypt.compare(password, user.password).then((foundOne)=>{
      if(foundOne){
        const {_id, firstName, email, role} = user
        const token = jwt.sign({_id:user.id}, process.env.SECRET_KEY)
        res.cookie("token", token, { expire: new Date() + 9999 });
        return res.status(200).json({token, user: { _id, firstName, email, role } })
      }else{
        return res.status(401).json({error:`Password or email is incorrect`})
      }
    }).catch((err)=>{
      return res.status(500).json({error:err ? err : `Somethings went wrong. Please try again later`})
    })
  })
}

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

//PROTECTED ROUTES

exports.isSignedIn = expressJwt({
  secret: process.env.SECRET_KEY,
  algorithms: ["HS256"],
  userProperty: "auth",
});

//CUSTOM MIDDLEWARE
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  } 
  next();
};


exports.isAdmin =(req, res, next)=>{
  if(req.profile.role===0){
    return res.status(403).json({
      error: "YOU ARE NOT ADMIN, ACCESS DENIED",
    });
  }
  next();
}