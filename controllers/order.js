const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const nodemailer = require("nodemailer");
const defaultEmailData = { from: "noreply@node-react.com" };
const sgMail = require('@sendgrid/mail');
const sgTransport = require('nodemailer-sendgrid-transport');


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

exports.updateOrderStatus = (req, res) => {
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


      client.sendMail(userOrderUpdate, function(err, info){
    if (err ){
      console.log(error);
    }
    else {
      console.log('Message sent:');
    }
});


      // trasporter.sendMail(userOrderUpdate);
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
