const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const nodemailer = require("nodemailer");
const defaultEmailData = { from: "noreply@node-react.com" };
const sgMail = require('@sendgrid/mail');
const sgTransport = require('nodemailer-sendgrid-transport');

const accountSid = 'AC8641b461a07dfa36d3b840ca8f6b8917';
const authToken = '0e13b7c16b50abbcaf9c400db41db5aa';

const unirest = require("unirest");

const twilio = require('twilio');




const clientwhat = require('twilio')(accountSid, authToken);
// const trasporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: false,
//   requireTLS: true,
//
//   auth: {
//     user: "shubhamaryan472@gmail.com",
//     pass: "intex472"
//   }
// });


const fast2sms = unirest("POST", "https://www.fast2sms.com/dev/bulk");

fast2sms.headers({
  "content-type": "application/x-www-form-urlencoded",
   "cache-control": "no-cache",
  "authorization": "WSH8p51mOhD4kwEbZdfoRxAvQJIKTPVgt72qeyCaUzBNXYMjuGudBGlhSfys7i1F3MNqpLnT6wYzVKPe"
});


const fast2cus = unirest("POST", "https://www.fast2sms.com/dev/bulk");

fast2cus.headers({

  "authorization": "WSH8p51mOhD4kwEbZdfoRxAvQJIKTPVgt72qeyCaUzBNXYMjuGudBGlhSfys7i1F3MNqpLnT6wYzVKPe"
});


const options = {
  auth: {
    api_user: 'saurabharyan',
    api_key: 'Saurabh@001'
  }
}




const client = nodemailer.createTransport(sgTransport(options));



exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      req.order = order;
      next();
    });
};

exports.create = (req, res) => {
  // console.log("CREATE ORDER: ", req.body);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    console.log(req.body.order.transaction_id);
    if (error) {
      return res.status(400).json({
        error: errorHandler(error)
      });
    }

    const emailData = {
      to: "saurabharyan30@gmail.com",
      from: "noreply@node-react.com",
      subject: `A new order is received`,
      html: `
      <div>
      <p>Customer name:${order.user.name}</p>
      <p>Total products: ${order.products.length}</p>
      <p>Total cost: ${order.amount},${order.user.email}</p>
      <p>Login to dashboard to the order in detail.</p>
      </div>

  `
    };

    const userEmailData = {
      to: `${order.user.email}`,
      from: "noreply@node-react.com",
      subject: `A new order is received`,
      html: `
      <p>Customer name:${order.user.name}</p>
      <p>Total products: ${order.products.length}</p>
      <p>Total cost: ${order.amount}</p>
      <p>Thank For Trusting Us</p>
  `
    };



    client.sendMail(emailData, function(err, info){
  if (err ){
    console.log(error);
  }
  else {
    console.log('Message sent:');
  }
});

client.sendMail(userEmailData, function(err, info){
if (err ){
console.log(error);
}
else {
console.log('Message sent:');
}
});
    // trasporter.sendMail(emailData);
    // trasporter.sendMail(userEmailData);
    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name mobile email")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) =>{
 Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      const userOrderUpdate = {
        to: `${req.body.orderEmail}`,
        from: "noreply@node-react.com",
        subject: `Order Live Update`,
        html: `
        <div>
        <p>Order Status:${req.body.status}</p>

        <p>Thank For Trusting Us</p>
        </div>

    `
      };

      clientwhat.messages
        .create({
          from:'whatsapp:+14155238886',
          to:'whatsapp:+917011944204',
          body:`hello sir You update the order to ${req.body.status} with Order Id ${req.body.orderId}`
        }).then(message=>{
          console.log(message.sid);
        });




  fast2cus.form({
    "sender_id": "FSTSMS",
    "language": "english",
    "route": "qt",
    "numbers": `${req.body.orderMobile}`,
    "message": "17920",
    "variables": "{#BB#}|{#EE#}",
    "variables_values": `${req.body.status}|${req.body.orderId}`
});

 fast2cus.end(function (res) {
  if (res.error) throw new Error(res.error);
  console.log(res.body);
});


//  fast2sms.form({
//   "sender_id": "FSTSMS",
//   "language": "english",
//   "route": "p",
//   "numbers": "7011944204",
//   "message": `hello sir You update the order to ${req.body.status} with Order Id ${req.body.orderId} `
// });
//
// fast2sms.end(function (res) {
//   if (res.error) throw new Error(res.error);
//   console.log(res.body);
// });



      res.json(order);
    }
  );
};

exports.ordersByUser = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json(orders);
    });
};
