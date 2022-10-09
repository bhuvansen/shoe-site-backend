const Product = require("../models/products")
const formidable = require("formidable")
const fs = require("fs")
const _ = require("lodash")
const { sortBy } = require("lodash")
const bodyParser = require("body-parser")

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
  .exec((err, product) => {
    if (err) {
      return res.status(400).json({
        error: "Product not found in DB",
      })
    }
    req.product = product
    next()
  })
}

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: `Cannot create product, please try again. Please check your image`,
      })
    }
    const { name, description, price, quantity, category } = fields
    if (!name || !description || !price || !quantity || !category) {
      return res.status(400).json({
        error: "Please fill all the required details",
      })
    }
    fields.quantity = JSON.parse(quantity)
    let product = new Product(fields)

    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({ error: `File size too big` })
      }
      product.photo.data = fs.readFileSync(file.photo.filepath)
      product.photo.contentType = file.photo.type
    } else {
      return res.status(422).json({ Error: "Please upload an image." })
    }
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: err,
        })
      }
      return res.status(200).json({ product })
    })
  })
}

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType)
    return res.send(req.product.photo.data)
  }
  next()
}

exports.getProduct = (req, res) => {
  return res.json(req.product)
}

// exports.getAllProduct = (req, res) => {
//   Product.find().exec((err, product) => {
//     if (err) {
//       return res.status(400).json({
//         error: "No product found",
//       })
//     }
//     return res.status(200).json(product)
//   })
// }

exports.getAllProduct = (req, res) => {
  let limit = req.query.limit ? parseInt(req.quer.limit) : 8
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id"
  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No product Found",
        })
      }
      res.json(products)
    })
}

exports.updateProduct = (req, res) => {
  let form = formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problme with image",
      })
    }

    //Updation code
    let product = req.product
    product = _.extend(product, fields)

    // Hnadle File
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size is too big",
        })
      }
      product.photo.data = fs.readFileSync(file.photo.path)
      product.photo.contentType = file.photo.type
    }

    //Save to the DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Updation Failed",
        })
      }
      res.json(product)
    })
  })
}
exports.deleteProduct = (req, res) => {
  const product = req.product

  product.remove((err, product) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete this product",
      })
    }
    return res.json({
      message: "Successfully deleted",
    })
  })
}

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No Category found",
      })
    }
    res.json(category)
  })
}

exports.updateStock = (req, res, next) => {
  req.body.map((orderedProduct)=>{
    Product.findOneAndUpdate(
      { _id: orderedProduct._id },
      { $set: { quantity: orderedProduct.quantity } },
      { new: true },
      (err, purchases) => {
        if (err) {
          return res.status(400).json({
            error: "Unable to save purchase list",
          })
        }
      }
    )
  })
  return res.status(200).json({
    message: "Success",
  })
}
