
const HttpStatus = require('http-status-codes');

const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Helper = require('../helpers/helpers');


module.exports = {
  async GetAllMessages(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    const conversation = await Conversation.findOne({
      $or: [
        {
          $and: [
            { 'participants.senderId': sender_Id },
            { 'participants.receiverId': receiver_Id }
          ]
        },
        {
          $and: [
            { 'participants.senderId': receiver_Id },
            { 'participants.receiverId': sender_Id }
          ]
        }
      ]
    }).select('_id');

    if (conversation) {
      const messages = await Message.findOne({
        conversationId: conversation._id
      });
      res
        .status(HttpStatus.OK)
        .json({ message: 'Messages returned', messages });
    }
  },

  SendMessage(req, res) {
    const { sender_Id, receiver_Id } = req.params;

    Conversation.find(
      {
        $or: [
          {
            participants: {
              $elemMatch: { senderId: sender_Id, receiverId: receiver_Id }
            }
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_Id }
            }
          }
        ]
      },
      async (err, result) => {
        if (result.length > 0) {
          
          await Message.update(
            {
              conversationId: result[0]._id
            },
            {
              $push: {
                message: {
                  senderId: req.params.sender_Id,
                  receiverId: req.params.receiver_Id,
                  sendername: req.body.senderName,
                  receivername: req.body.receiverName,
                  body: req.body.message
                }
              }
            }
          )
            .then(() =>
              res
                .status(HttpStatus.OK)
                .json({ message: 'Message sent successfully' })
            )
            .catch(err =>
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error occured' })
            );
        } else {
          const newConversation = new Conversation();
          newConversation.participants.push({
            senderId: req.params.sender_Id,
            receiverId: req.params.receiver_Id
          });

          const saveConversation = await newConversation.save();

          const newMessage = new Message();
          newMessage.conversationId = saveConversation._id;
          newMessage.sender = req.body.senderName;
          newMessage.receiver = req.body.receiverName;
          newMessage.message.push({
            senderId: req.params.sender_Id,
            receiverId: req.params.receiver_Id,
            sendername: req.body.senderName,
            receivername: req.body.receiverName,
            body: req.body.message
          });

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
                      msgId: newMessage._id
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
                      msgId: newMessage._id
                    }
                  ],
                  $position: 0
                }
              }
            }
          );

          await newMessage
            .save()
            .then(() =>
              res.status(HttpStatus.OK).json({ message: 'Message sent' })
            )
            .catch(err =>
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error occured' })
            );
        }
      }
    );
  }

  
};
