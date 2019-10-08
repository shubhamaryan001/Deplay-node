const express = require('express')
const router = express.Router()
const { create, deactivate, remove, list, find } = require('../controllers/coupon')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

router.post('/coupon/create', requireSignin, create)
router.put('/coupon/deactivate/:code', requireSignin, deactivate)
router.delete('/coupon/:code', requireSignin, remove)
router.get('/coupon/:code', find)
router.get('/coupon', list)

module.exports = router
