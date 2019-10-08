const User = require('../models/user')
const { errorHandler } = require('../helpers/dbErrorHandler')

// Add Balance
// Body Required -
// 1. amount type { Number }
// 2. Description type { Object }
// 3. Type type { String - 'Debit || Credit' }
exports.addBalance = async (req, res) => {
  try {
    const userWallet = await User.findById(req.params.userId)
    if (req.body.amount) {
      userWallet.wallet_balance += parseInt(req.body.amount)
    } else {
      throw new Error('Enter a valid Amount!')
    }
    // details are not mandatory!
    if (req.body.details) {
      userWallet.wallet_history.push(req.body.details)
    }
    userWallet.save()
    res.json({
      success: true,
      message: 'Wallet updated!'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message ? err.message : 'Something went wrong'
    })
  }
}

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, { wallet_balance: 1 })
    res.json(user ? { user, success: true } : { success: false, message: 'Something went wrong' })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message ? err.message : 'Something went wrong'
    })
  }
}

// Deduct Balance
// Body Required -
// 1. amount type { Number }
// 2. Description type { Object }
// 3. Type type { String - 'Debit || Credit' }
exports.deductBalance = async (req, res) => {
  try {
    const userWallet = await User.findById(req.params.userId)
    if (req.body.amount) {
      userWallet.wallet_balance -= parseInt(req.body.amount)
    } else {
      throw new Error('Enter a valid Amount!')
    }
    // details are not mandatory!
    if (req.body.details) {
      userWallet.wallet_history.push(req.body.details)
    }
    userWallet.save()
    res.json({
      success: true,
      message: 'Wallet updated!'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message ? err.message : 'Something went wrong'
    })
  }
}
