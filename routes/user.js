const express = require("express");
const router = express.Router();

const {
  userById,
  read,
  update,
  purchaseHistory,GetAllUsers,AdminUsers,GetUserByName,updateUser,userPhoto
} = require("../controllers/user");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");


router.get("/users", requireSignin, GetAllUsers);
router.get("/adminusers", requireSignin,AdminUsers);

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, updateUser);
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);
router.get("/name/:name", requireSignin,GetUserByName);
router.get("/user/photo/:userId", userPhoto);


router.param("userId", userById);
module.exports = router;
