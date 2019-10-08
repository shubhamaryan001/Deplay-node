const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    discount: {
      type: Number,
      required: true,
      max: 90,
      min: 10
    },
    isFlat: {
      type: Boolean,
      default: false
      //   Just like flat Rs.500 off
      //   if flat discount, deduct the discount from total amount else calculate the percentage from discount
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Coupons', couponSchema)
