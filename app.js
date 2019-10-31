const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
//App
const app = express();


const server = require('http').createServer(app);

const io = require('socket.io').listen(server);

require('./socket/private')(io);
require('./socket/streams')(io);


require("dotenv").config();
//import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const couponRoutes = require("./routes/coupon");
const productRoutes = require("./routes/product");
const walletRoutes = require("./routes/wallet");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/order");
const messageRoutes = require("./routes/message");



//DB
mongoose.connect(
  process.env.DATABASE,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  },
  err => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);

//middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

//Routes middlewares
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", couponRoutes);
app.use("/api", productRoutes);
app.use("/api", walletRoutes);
app.use("/api", paymentRoutes);
app.use("/api", orderRoutes);
app.use("/api", messageRoutes);
const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
