require("dotenv").config()
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)
const { v4: uuidv4 } = require("uuid")


exports.makepayment = (req, res) => {
  const line_items = req.body.cartItems.map((item) => {
    return {
      price_data: {
        currency: "INR",
        product_data: {
          name: item.name,
          //   images: [item.image],
          //   category: item.category,
          metadata: {
            id: item._id,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }
  })

  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "INR",
            },
            display_name: "Free shipping",
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 50000,
              currency: "INR",
            },
            display_name: "Next day air",
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success/session_id/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    })
    .then((session) => {
      return res.send({ url: session.url })
    })
}

// }

exports.getSessionId = (req, res, next, id) => {
  req.sessionId = id
  next()
}
exports.retrievePayment = async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.sessionId)
  const customer = await stripe.customers.retrieve(session.customer)
  res.status(200).send(customer)
}
