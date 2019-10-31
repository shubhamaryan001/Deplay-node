const express = require("express");
const router = express.Router();


const MessageCtrl = require('../controllers/message');
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get(
  '/chat-messages/:sender_Id/:receiver_Id',
  requireSignin,
  MessageCtrl.GetAllMessages);


router.post(
    '/chat-messages/:sender_Id/:receiver_Id',
    requireSignin,
    MessageCtrl.SendMessage
  );
  



module.exports = router;
