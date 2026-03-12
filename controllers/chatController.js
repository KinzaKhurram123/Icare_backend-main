const ChatMessage = require("../models/chatmessage");
const pusher = require("../config/pusher.config");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, attachments } = req.body;
    const senderId = req.user.id;

    const newMessage = await ChatMessage.create({
      sender: senderId,
      receiver: receiverId,
      message,
      attachments: attachments || [],
    });

    await newMessage.populate("sender", "name email profileImage");
    await newMessage.populate("receiver", "name email profileImage");

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
    const { userId } = req.params;
    const currentUserId = req.user.id;

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
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const currentUserId = req.user.id;

    await ChatMessage.updateMany(
      { sender: senderId, receiver: currentUserId, read: false },
      { read: true },
    );

    await pusher.trigger(`private-chat-${senderId}`, "messages-read", {
      reader: currentUserId,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

exports.typingIndicator = async (req, res) => {
  try {
    const { receiverId, isTyping } = req.body;
    const senderId = req.user.id;

    await pusher.trigger(`private-chat-${receiverId}`, "typing-indicator", {
      user: senderId,
      isTyping,
      timestamp: Date.now(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send typing indicator",
    });
  }
};
