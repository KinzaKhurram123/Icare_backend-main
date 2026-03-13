const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const pusherAuth = require("../middleware/pusherAuth");
const pusher = require("../config/pusher.config");

const {
  sendMessage,
  getChatHistory,
  markAsRead,
  typingIndicator,
  getConversations,
} = require("../controllers/chatController");

router.post("/pusher/auth", pusherAuth, (req, res) => {
  try {
    const { socket_id, channel_name } = req;
    const user = req.user;

    if (channel_name.startsWith("presence-")) {
      const presenceData = {
        user_id: user._id.toString(),
        user_info: {
          name: user.name,
          email: user.email,
          image: user.profileImage || null,
        },
      };
      const auth = pusher.authenticate(socket_id, channel_name, presenceData);
      res.send(auth);
    } else if (channel_name.startsWith("private-")) {
      const auth = pusher.authenticate(socket_id, channel_name);
      res.send(auth);
    } else {
      res.status(400).json({ error: "Invalid channel type" });
    }
  } catch (error) {
    console.error("Pusher auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.use(protect);

router.get("/conversations", getConversations);
router.post("/send", sendMessage);
router.get("/history/:userId", getChatHistory);
router.put("/read", markAsRead);
router.post("/typing", typingIndicator);

module.exports = router;
