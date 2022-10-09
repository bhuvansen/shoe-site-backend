var mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const { Schema } = mongoose
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    maxLength: 32,
    trim: true,
  },
  lastName: {
    type: String,
    maxLength: 32,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userInfo: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  purchases: {
    type: Array,
    default: [],
  },
  cartItems:{
    type: Array,
    default: [],
  }
}, {timestamps:true})
userSchema.pre('save',async function(next){
  if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})
module.exports = mongoose.model("User", userSchema);
