const Coupon = require('../models/coupon')
const { errorHandler } = require('../helpers/dbErrorHandler')

// Create Coupon
// Body Required -
// 1. code
// 2. isActive
// 3. discount
// 4. isFlat
exports.create = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.json(coupon)
  } catch (err) {
    console.log(err.message)
    return res.status(400).json({
      error: errorHandler(err)
    })
  }
}

exports.find = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code })
    res.json(coupon ? { coupon, success: true } : { success: false, message: 'Invalid Coupon' })
  } catch (err) {
    console.log(err.message)
    return res.status(400).json({
      error: errorHandler(err)
    })
  }
}

exports.deactivate = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndUpdate(
      { code: req.params.code },
      { $set: { isActive: false } },
      { new: true }
    )
    res.json(coupon)
  } catch (err) {
    res.status(400).json({
      error: errorHandler(err)
    })
  }
}

// Remove Coupon - code required
exports.remove = async (req, res) => {
  try {
    await Coupon.remove({ code: req.params.code })
    res.json({
      message: 'Coupon Removed'
    })
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(err)
    })
  }
}

exports.list = (req, res) => {
  Coupon.find().exec((err, coupons) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    res.json(coupons.length ? coupons : 'NO active coupons!')
  })
}
