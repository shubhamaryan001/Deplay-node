const User = require("../models/user");
const { Order } = require("../models/order");
const httpStatus = require('http-status-codes');

const { errorHandler } = require("../helpers/dbErrorHandler");


const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");






exports.GetAllUsers=(req, res)=> {
  User.find({"role": 0})

    .then(result => {
      res.status(httpStatus.OK).json({ message: 'All Customers', result });
    })
    .catch(err => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
}

exports.GetUserByName=(req, res)=> {
  User.findOne({name:req.params.name})

    .then(result => {
      res.status(httpStatus.OK).json({ message: 'User By Name', result });
    })
    .catch(err => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occured' });
    });
}


exports.AdminUsers = (req, res) => {


  User.find({"role": 1})


    .then(result => {
      res.status(httpStatus.OK).json({ message: 'All Admins', result });
    })
    .catch(err => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err });
    });
},


// exports.list = (req, res) => {
//   let order = req.query.order ? req.query.order : "asc";
//   let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
//   let limit = req.query.limit ? parseInt(req.query.limit) : 6;

//   Product.find()
//     .select("-photo")
//     .populate("category")
//     .sort([[sortBy, order]])
//     .limit(limit)
//     .exec((err, products) => {
//       if (err) {
//         return res.status(400).json({
//           error: "Products not found"
//         });
//       }
//       res.json(products);
//     });
// };



exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found"
      });
    }
    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to perform this action"
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    // console.log("incoming form data: ", form);
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save user
        let user = req.profile;
        // console.log("user in update: ", user);
        user = _.extend(user, fields);

        user.updated = Date.now();
        // console.log("USER FORM DATA UPDATE: ", user);

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            // console.log("user after update with formdata: ", user);
            res.json(user);
        });
    });
};


exports.userPhoto = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set(('Content-Type', req.profile.photo.contentType));
        return res.send(req.profile.photo.data);
    }
    next();
};






exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach(item => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      order_status: req.body.order.status,
      amount: req.body.order.amount
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history"
        });
      }
      next();
    }
  );
};

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(orders);
    });
};
