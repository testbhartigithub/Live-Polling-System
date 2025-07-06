// 💬 ENHANCED CHAT API ROUTES
// Handles chat messaging functionality with user roles

const express = require("express")
const router = express.Router()
const storage = require("../lib/storage")

// 📤 SEND MESSAGE (Enhanced with user role)
router.post("/send", (req, res) => {
  try {
    const { pollId, user, message, timestamp, userRole } = req.body

    // Validate input
    if (!pollId || !user || !message || !timestamp) {
      return res.status(400).json({
        error: "Missing required message data",
        success: false,
      })
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: "Message cannot be empty",
        success: false,
      })
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: "Message too long (max 500 characters)",
        success: false,
      })
    }

    console.log(
      `💬 New message from ${user} (${userRole}): "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
    )

    const newMessage = storage.addMessage(pollId, {
      user,
      message: message.trim(),
      timestamp,
      userRole: userRole || "student",
    })

    res.json({
      message: newMessage,
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to send message:", error)
    res.status(500).json({
      error: "Failed to send message",
      success: false,
    })
  }
})

// 📥 GET MESSAGES
router.get("/messages", (req, res) => {
  try {
    const { pollId } = req.query

    if (!pollId) {
      return res.status(400).json({
        error: "Poll ID required",
        success: false,
      })
    }

    const messages = storage.getMessages(pollId)

    res.json({
      messages,
      count: messages.length,
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to fetch messages:", error)
    res.status(500).json({
      error: "Failed to fetch messages",
      success: false,
    })
  }
})

module.exports = router
