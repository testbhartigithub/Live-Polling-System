// 👥 ENHANCED PARTICIPANT API ROUTES
// Handles participant management with kick functionality

const express = require("express")
const router = express.Router()
const storage = require("../lib/storage")

// 📋 GET PARTICIPANTS
router.get("/", (req, res) => {
  try {
    const { pollId } = req.query

    if (!pollId) {
      return res.status(400).json({
        error: "Poll ID required",
        success: false,
      })
    }

    const participants = storage.getParticipants(pollId)

    res.json({
      participants,
      count: participants.length,
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to fetch participants:", error)
    res.status(500).json({
      error: "Failed to fetch participants",
      success: false,
    })
  }
})

// ➕ ADD PARTICIPANT (Enhanced with kick check)
router.post("/", (req, res) => {
  try {
    const { pollId, participant } = req.body

    if (!pollId || !participant || !participant.id || !participant.name || !participant.role) {
      return res.status(400).json({
        error: "Invalid participant data",
        success: false,
      })
    }

    console.log(`👥 Participant joining: ${participant.name} (${participant.role})`)

    const participants = storage.addParticipant(pollId, participant)

    res.json({
      participants,
      count: participants.length,
      success: true,
      message: "Participant added successfully",
    })
  } catch (error) {
    console.error("❌ Failed to add participant:", error)

    // Handle kicked user error
    if (error.message.includes("removed from this poll")) {
      return res.status(403).json({
        error: error.message,
        success: false,
        kicked: true,
      })
    }

    res.status(500).json({
      error: "Failed to add participant",
      success: false,
    })
  }
})

// 🚫 KICK PARTICIPANT (Enhanced functionality)
router.post("/kick", (req, res) => {
  try {
    const { participantId, pollId } = req.body

    if (!participantId || !pollId) {
      return res.status(400).json({
        error: "Participant ID and Poll ID required",
        success: false,
      })
    }

    console.log(`🚫 Kicking participant: ${participantId} from poll ${pollId}`)

    const result = storage.kickParticipant(pollId, participantId)

    res.json({
      participants: result.participants,
      kickedParticipant: result.kickedParticipant,
      count: result.participants.length,
      success: true,
      message: `${result.kickedParticipant.name} has been removed from the poll`,
    })
  } catch (error) {
    console.error("❌ Failed to kick participant:", error)
    res.status(400).json({
      error: error.message || "Failed to remove participant",
      success: false,
    })
  }
})

// ✅ CHECK KICK STATUS
router.get("/kick-status", (req, res) => {
  try {
    const { pollId, userId } = req.query

    if (!pollId || !userId) {
      return res.status(400).json({
        error: "Poll ID and User ID required",
        success: false,
      })
    }

    const isKicked = storage.isUserKicked(pollId, userId)

    res.json({
      isKicked,
      success: true,
    })
  } catch (error) {
    console.error("❌ Failed to check kick status:", error)
    res.status(500).json({
      error: "Failed to check kick status",
      success: false,
    })
  }
})

module.exports = router
