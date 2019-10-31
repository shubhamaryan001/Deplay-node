const User = require('../models/user');


module.exports = {

 

  updateChatList: async (req, message) => {
    await User.update(
      {
        _id: req.params.sender_Id
      },
      {
        $pull: {
          chatList: {
            receiverId: req.params.receiver_Id
          }
        }
      }
    );

    await User.update(
      {
        _id: req.params.receiver_Id
      },
      {
        $pull: {
          chatList: {
            receiverId: req.params.sender_Id
          }
        }
      }
    );

    await User.update(
      {
        _id: req.params.sender_Id
      },
      {
        $push: {
          chatList: {
            $each: [
              {
                receiverId: req.params.receiver_Id,
                msgId: message._id
              }
            ],
            $position: 0
          }
        }
      }
    );

    await User.update(
      {
        _id: req.params.receiver_Id
      },
      {
        $push: {
          chatList: {
            $each: [
              {
                receiverId: req.params.sender_Id,
                msgId: message._id
              }
            ],
            $position: 0
          }
        }
      }
    );
  }
};
