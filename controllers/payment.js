const User = require("../models/user");
require("dotenv").config();
const Razorpay = require("razorpay");
const { Order } = require("../models/order");

var instance = new Razorpay({
  key_id: "rzp_test_xHFa7oLm0s4xHO",
  key_secret: "zC97MKBrEsjAqzHMyQNuzoK3"
});

exports.processPayment = (req, res) => {
  const razorPayId = req.body.razorpay_payment_id;
  const currentCharges = Math.round(req.body.amount * 100);

  instance.payments
    .capture(razorPayId, currentCharges)

    .then(captureResponse => {
      if (captureResponse.status === "captured") {
        res.json({
          success: true
        });
        console.log(`Payment #${captureResponse.id} Captured`);
      }
    })

    .catch(error => {
      console.log(`Error capturing payment #${razorPayId}`);
      console.log(error);
      res.status(400).json({
        success: false,
        message: `Order Failed. Error processing payment #${razorPayId}`,
        error
      });
    });
};
