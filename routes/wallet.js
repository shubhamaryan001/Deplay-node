const express = require('express')
const router = express.Router()
const { addBalance, getBalance, deductBalance } = require('../controllers/wallet')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

router.post('/wallet/add/:userId', requireSignin, addBalance)
router.post('/wallet/deduct/:userId', requireSignin, deductBalance)
router.get('/wallet/balance/:userId', getBalance)

module.exports = router
