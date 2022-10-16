const User = require("../models/user")
const Order = require("../models/order")
const bcrypt = require('bcrypt');


exports.getUserById=(req, res, next, id)=>{
    User.findById(id).exec((err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: `No user found`
            })
        }
        req.profile = user
        next()
    })
}

exports.getSize=(req, res, next, size)=>{
  req.size = size
  next()
}

exports.getUser=(req, res)=>{
    req.profile.password = undefined
    return res.json(req.profile)
} 

exports.checkPassword=async(req, res, next)=>{
  if (req.body.password){
    if(req.body.password.length<6){
      return res.status(400).json({
        error: `Password should be atleast 6 characters long`
    })
    }else{
      let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^\&*\)\(+=._-])[!-~]{6,}$/
      if (!regex.test(req.body.password)){
        return res.status(400).json({
          error: `Password should be combination of Uppercase, lowercase, digits and special characters`
        })
      }else{
        req.body.password = await bcrypt.hash(req.body.password, 12)
      }
    }
  }
  if(req.body.firstName){
    if(req.body.firstName.length<6){
      return res.status(400).json({
        error: `First Name should be atleast 3 characters long`
      })
    }
  }
  if (req.body.email){
    if(req.body.email.length===0){
      return res.status(400).json({
        error: `Email field cannot be empty`
      })
    }else{
      let regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/i
      if (!regex.test(req.body.email)){
        return res.status(400).json({
          error: `Please enter a valid email`
        })
      }
    }
  }
  next()
}

exports.updateUser=(req, res)=>{ 
    User.findByIdAndUpdate(
        {_id : req.profile._id},
        {$set: req.body},
        { new: true, useFindAndModify: false },
        (err, user)=>{
            if(err){
                return res.status(400).json({error: "Update unsuccessfull"})
            }else{
                const {_id, firstName, email, role} = user
                return res.json({ _id, firstName, email, role })
            }
        }
    )

}

exports.userPurchaseList = (req, res) => {
    Order.find({ user: req.profile._id })
      .populate("user", "_id name")
      .exec((err, order) => {
        if (err) {
          return res.status(400).json({
            error: "No Order in this account",
          });
        }
        return res.json(order);
      });
  };
  

exports.pushOrderInPurchaseList = (req, res, next) => {
    let purchases = [];
    req.body.order.products.forEach((product) => {
      purchases.push({
        _id: product._id,
        name: product.name,
        category: product.category,
        size: product.size,
        quantity: product.quantity,
        amount: req.body.order.amount,
        transaction_id: req.body.order.transaction_id,
        status: "Received"
      });
    });
      // Store this in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },
    { new: true },
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list",
        });
      }
      next();
    }
  );

}


exports.pushOrderInCartList = (req, res, next) => {
  let cartItems = {
        _id: req.body._id,
        name: req.body.name,
        category: req.body.category,
        quantity: req.body.quantity,
        price: req.body.price,
        size: req.body.size,
      }
      // Store this in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { cartItems: cartItems }},
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to add item in cart",
        });
      }
      let cartList = []
      j= 0
      for(let i in user.cartItems){
        if(cartList.length===0){
          cartList[j]={}
          cartList[j]._id= user.cartItems[0]._id
          cartList[j].name= user.cartItems[0].name
          cartList[j].category= user.cartItems[0].category
          cartList[j].quantity= user.cartItems.filter((item) => (item._id === user.cartItems[0]._id && item.size === user.cartItems[0].size)).length
          cartList[j].price= user.cartItems[0].price
          cartList[j].size= user.cartItems[0].size
          j = j+1
        } else {
          let matched = cartList.filter((item) => item._id === user.cartItems[i]._id && item.size === user.cartItems[i].size) 
          if(!matched || matched.length===0){
            cartList[j]={}
            cartList[j]._id= user.cartItems[i]._id
            cartList[j].name= user.cartItems[i].name
            cartList[j].category= user.cartItems[i].category
            cartList[j].quantity= user.cartItems.filter((item) => (item._id === user.cartItems[i]._id && item.size === user.cartItems[i].size)).length
            cartList[j].price= user.cartItems[i].price
            cartList[j].size= user.cartItems[i].size
            j = j+1
          }
        }
        if(parseInt(i)===parseInt(user.cartItems.length-1)){
          return res.status(200).json(cartList)
        }
      }
    }
  );

}

exports.deleteItemFromCart = (req, res) => {
  const product = req.product
  let body = req.profile
  let size = req.size
  // let cart = body.cartItem.filter((item)=>!(item._id===product._id.toString() && parseInt(body.cartItems[i].size) === parseInt(size)))
  for( var i = 0; i < body.cartItems.length; i++){ 
    if ((body.cartItems[i]._id === product._id.toString()) && parseInt(body.cartItems[i].size) === parseInt(size)) { 
      console.log("match product", product)
      body.cartItems.splice(i, 1)
      break
    }
  }
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: { cartItems:  body.cartItems } },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to update item in cart",
        });
      }
      console.log("SAVED LENGTH", user.cartItems.length)
      let cartList = []
      j= 0
      if(user.cartItems.length===0){
        return res.status(200).json(cartList)
      }
      for(let i in user.cartItems){
        if(cartList.length===0){
          cartList[j]={}
          cartList[j]._id= user.cartItems[0]._id
          cartList[j].name= user.cartItems[0].name
          cartList[j].category= user.cartItems[0].category
          cartList[j].quantity= user.cartItems.filter((item) => (item._id === user.cartItems[0]._id && item.size === user.cartItems[0].size)).length
          cartList[j].price= user.cartItems[0].price
          cartList[j].size= user.cartItems[0].size
          j = j+1
        }else{
          let matched = cartList.filter((item) => item._id === user.cartItems[i]._id && item.size === user.cartItems[i].size) 
          if(!matched || matched.length===0){
            cartList[j]={}
            cartList[j]._id= user.cartItems[i]._id
            cartList[j].name= user.cartItems[i].name
            cartList[j].category= user.cartItems[i].category
            cartList[j].quantity= user.cartItems.filter((item) => (item._id === user.cartItems[i]._id && item.size === user.cartItems[i].size)).length
            cartList[j].price= user.cartItems[i].price
            cartList[j].size= user.cartItems[i].size
            j = j+1
          }
        }
        if(parseInt(i)===parseInt(user.cartItems.length-1)){
          return res.status(200).json(cartList)
        }
      }
    }
);
}

exports.updateCart = (req, res) => {
  // const product = req.product
  // let body = req.profile
  // let size = req.size
  let body = req.body
  // // let cart = body.cartItem.filter((item)=>!(item._id===product._id.toString() && parseInt(body.cartItems[i].size) === parseInt(size)))
  // for( var i = 0; i < body.cartItems.length; i++){ 
  //   if ((body.cartItems[i]._id === product._id.toString()) && parseInt(body.cartItems[i].size) === parseInt(size)) { 
  //     console.log("match product", product)
  //     body.cartItems.splice(i, 1)
  //     break
  //   }
  // }
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: { cartItems:  body } },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to update item in cart",
        });
      }
      let cartList = []
      j= 0
      if(user.cartItems.length===0){
        return res.status(200).json(cartList)
      }
      for(let i in user.cartItems){
        if(cartList.length===0){
          cartList[j]={}
          cartList[j]._id= user.cartItems[0]._id
          cartList[j].name= user.cartItems[0].name
          cartList[j].category= user.cartItems[0].category
          cartList[j].quantity= user.cartItems.filter((item) => (item._id === user.cartItems[0]._id && item.size === user.cartItems[0].size)).length
          cartList[j].price= user.cartItems[0].price
          cartList[j].size= user.cartItems[0].size
          j = j+1
        }else{
          let matched = cartList.filter((item) => item._id === user.cartItems[i]._id && item.size === user.cartItems[i].size) 
          if(!matched || matched.length===0){
            cartList[j]={}
            cartList[j]._id= user.cartItems[i]._id
            cartList[j].name= user.cartItems[i].name
            cartList[j].category= user.cartItems[i].category
            cartList[j].quantity= user.cartItems.filter((item) => (item._id === user.cartItems[i]._id && item.size === user.cartItems[i].size)).length
            cartList[j].price= user.cartItems[i].price
            cartList[j].size= user.cartItems[i].size
            j = j+1
          }
        }
        if(parseInt(i)===parseInt(user.cartItems.length-1)){
          return res.status(200).json(cartList)
        }
      }
    }
);
}

exports.userCartList=(req, res)=>{
    let cartItems = req.profile.cartItems
    if(!cartItems || cartItems.length===0){
        return res.status(200).json([])
    }    
    let cartList = []
      j= 0
      for(let i in cartItems){
        if(cartList.length===0){
          cartList[j]={}
          cartList[j]._id= cartItems[0]._id
          cartList[j].name= cartItems[0].name
          cartList[j].category= cartItems[0].category
          cartList[j].quantity= cartItems.filter((item) => (item._id === cartItems[0]._id && item.size === cartItems[0].size)).length
          cartList[j].price= cartItems[0].price
          cartList[j].size= cartItems[0].size
          j = j+1
        }else{
          let matched = cartList.filter((item) => item._id === cartItems[i]._id && item.size === cartItems[i].size) 
          if(!matched || matched.length===0){
            cartList[j]={}
            cartList[j]._id= cartItems[i]._id
            cartList[j].name= cartItems[i].name
            cartList[j].category= cartItems[i].category
            cartList[j].quantity= cartItems.filter((item) => (item._id === cartItems[i]._id && item.size === cartItems[i].size)).length
            cartList[j].price= cartItems[i].price
            cartList[j].size= cartItems[i].size
            j = j+1
          }
        }
        if(parseInt(i)===parseInt(cartItems.length-1)){
          return res.status(200).json(cartList)
        }
      }
}


