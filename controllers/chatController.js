const ChatMessage = require("../models/chatmessage");
const Notification = require("../models/notification");
const pusher = require("../config/pusher.config");
const { sendPushNotification } = require("../config/firebase");

exports.sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { receiverId, message, attachments } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message are required",
      });
    }

    const senderId = req.user._id || req.user.id;
    console.log("Sending message from:", senderId, "to:", receiverId);

    const newMessage = await ChatMessage.create({
      sender: senderId,
      receiver: receiverId,
      message,
      attachments: attachments || [],
      read: false,
    });

    await newMessage.populate("sender", "name email profileImage");
    await newMessage.populate("receiver", "name email profileImage");

    // Create notification for receiver
    try {
      await Notification.create({
        user: receiverId,
        type: 'general',
        title: 'New Message',
        message: `${newMessage.sender.name} sent you a message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        read: false,
        data: { senderId: senderId.toString(), senderName: newMessage.sender.name },
      });

      // FCM push to receiver's device
      const User = require('../models/user');
      const receiver = await User.findById(receiverId).select('fcmToken');
      if (receiver?.fcmToken) {
        await sendPushNotification(
          receiver.fcmToken,
          `New message from ${newMessage.sender.name}`,
          message.substring(0, 100),
          { type: 'chat', senderId: senderId.toString(), senderName: newMessage.sender.name }
        );
      }
    } catch (notifErr) {
      console.warn("Could not create notification (non-critical):", notifErr.message);
    }

    // Pusher is non-critical — don't let it crash the message send
    try {
      await pusher.trigger(`private-chat-${receiverId}`, "new-message", {
        message: newMessage,
        sender: senderId,
        timestamp: new Date().toISOString(),
      });
      await pusher.trigger(`private-chat-${senderId}`, "message-sent", {
        message: newMessage,
        receiver: receiverId,
        timestamp: new Date().toISOString(),
      });
    } catch (pusherError) {
      console.warn("Pusher trigger failed (non-critical):", pusherError.message);
    }

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    console.log("Getting chat history for:", currentUserId, "with:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage");

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { senderId } = req.body;
    const currentUserId = req.user._id || req.user.id;

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "Sender ID is required",
      });
    }

    const result = await ChatMessage.updateMany(
      { sender: senderId, receiver: currentUserId, read: false },
      { read: true },
    );

    console.log(`Marked ${result.modifiedCount} messages as read`);

    try {
      await pusher.trigger(`private-chat-${senderId}`, "messages-read", {
        reader: currentUserId,
        timestamp: new Date().toISOString(),
      });
    } catch (pusherError) {
      console.warn("Pusher trigger failed (non-critical):", pusherError.message);
    }

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

exports.typingIndicator = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { receiverId, isTyping } = req.body;
    const senderId = req.user._id || req.user.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    try {
      await pusher.trigger(`private-chat-${receiverId}`, "typing-indicator", {
        user: senderId,
        isTyping: isTyping || false,
        timestamp: Date.now(),
      });
    } catch (pusherError) {
      console.warn("Pusher trigger failed (non-critical):", pusherError.message);
    }

    res.json({
      success: true,
      message: "Typing indicator sent",
    });
  } catch (error) {
    console.error("Typing indicator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send typing indicator",
      error: error.message,
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    console.log("getConversations called");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated - Please login again",
      });
    }

    const mongoose = require("mongoose");
    const currentUserId = new mongoose.Types.ObjectId(
      req.user._id ? req.user._id.toString() : req.user.id
    );

    console.log("Current User ID:", currentUserId);

    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", currentUserId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    console.log(`Found ${conversations.length} conversations`);

    const User = require("../models/user");
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        try {
          const user = await User.findById(conv._id).select(
            "name email profileImage role",
          );
          return {
            userId: conv._id,
            user: user,
            lastMessage: conv.lastMessage,
            lastMessageTime: conv.lastMessageTime,
            unreadCount: conv.unreadCount,
          };
        } catch (err) {
          console.error(`Error fetching user ${conv._id}:`, err);
          return null;
        }
      }),
    );

    const validConversations = conversationsWithUsers.filter(
      (c) => c !== null && c.user !== null,
    );

    res.json({
      success: true,
      data: validConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};
