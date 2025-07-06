// 🎯 ENHANCED POLL API ROUTES
// Handles all poll-related API endpoints with new features

const express = require("express")
const router = express.Router()
const storage = require("../lib/storage")

// 📋 GET ALL POLLS (Including past results)
router.get("/", (req, res) => {
  try {
    const polls = storage.getAllPolls()
    const activePoll = storage.getActivePoll()
    const pastPolls = storage.getPastPolls()

    res.json({
      polls,
      activePoll,
      pastPolls,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ GET /api/polls failed:", error)
    res.status(500).json({
      error: "Failed to fetch polls",
      success: false,
    })
  }
})

// 📈 GET PAST POLL RESULTS
router.get("/history", (req, res) => {
  try {
    const pastPolls = storage.getPastPolls()

    res.json({
      pastPolls,
      count: pastPolls.length,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ GET /api/polls/history failed:", error)
    res.status(500).json({
      error: "Failed to fetch poll history",
      success: false,
    })
  }
})

// 📊 GET POLL ANALYTICS
router.get("/analytics/:pollId", (req, res) => {
  try {
    const { pollId } = req.params
    const analytics = storage.getPollAnalytics(pollId)

    if (!analytics) {
      return res.status(404).json({
        error: "Poll not found",
        success: false,
      })
    }

    res.json({
      analytics,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ GET /api/polls/analytics failed:", error)
    res.status(500).json({
      error: "Failed to fetch poll analytics",
      success: false,
    })
  }
})

// ➕ CREATE NEW POLL (Enhanced with configurable time)
router.post("/", (req, res) => {
  try {
    const pollData = req.body

    // Enhanced validation
    if (!pollData.question || !pollData.options || pollData.options.length < 2) {
      return res.status(400).json({
        error: "Invalid poll data. Question and at least 2 options required.",
        success: false,
      })
    }

    // Validate time limit
    if (pollData.timeLimit && (pollData.timeLimit < 10 || pollData.timeLimit > 600)) {
      return res.status(400).json({
        error: "Time limit must be between 10 and 600 seconds",
        success: false,
      })
    }

    const newPoll = storage.createPoll(pollData)

    console.log(`🎯 New poll by ${pollData.createdBy}:`)
    console.log(`   Question: ${pollData.question}`)
    console.log(`   Options: ${pollData.options.join(", ")}`)
    console.log(`   Time Limit: ${pollData.timeLimit || 60} seconds`)

    res.status(201).json(newPoll)
  } catch (error) {
    console.error("❌ POST /api/polls failed:", error)
    res.status(500).json({
      error: "Failed to create poll",
      success: false,
    })
  }
})

// 🎯 GET ACTIVE POLL
router.get("/active", (req, res) => {
  try {
    const activePoll = storage.getActivePoll()

    res.json({
      poll: activePoll,
      hasActivePoll: !!activePoll,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Failed to fetch active poll:", error)
    res.status(500).json({
      error: "Failed to fetch active poll",
      success: false,
    })
  }
})

// 🗳️ SUBMIT VOTE (Enhanced with kick check)
router.post("/vote", (req, res) => {
  try {
    const { pollId, optionIndex, userId, userName } = req.body

    console.log(`🗳️ Vote attempt: ${userName} voting for option ${optionIndex + 1}`)

    // Validate input
    if (!pollId || optionIndex === undefined || !userId || !userName) {
      return res.status(400).json({
        error: "Missing required vote data",
        success: false,
      })
    }

    const updatedPoll = storage.addVote(pollId, optionIndex, userId, userName)

    console.log(`✅ Vote recorded for ${userName}`)

    res.json({
      poll: updatedPoll,
      success: true,
      message: "Vote recorded successfully",
    })
  } catch (error) {
    console.error("❌ Vote submission failed:", error)
    res.status(400).json({
      error: error.message || "Failed to record vote",
      success: false,
    })
  }
})

// 🏁 END POLL
router.patch("/:id", (req, res) => {
  try {
    const { isActive } = req.body

    if (isActive === false) {
      const endedPoll = storage.endCurrentPoll()

      if (endedPoll && endedPoll.id === req.params.id) {
        return res.json(endedPoll)
      }
    }

    res.status(404).json({
      error: "Poll not found or already ended",
      success: false,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to update poll",
      success: false,
    })
  }
})

// 📊 GET SYSTEM STATISTICS
router.get("/stats", (req, res) => {
  try {
    const stats = storage.getSystemStats()

    res.json({
      stats,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ GET /api/polls/stats failed:", error)
    res.status(500).json({
      error: "Failed to fetch system stats",
      success: false,
    })
  }
})

module.exports = router
