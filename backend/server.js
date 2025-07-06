// 🚀 LIVE POLLING SYSTEM - BACKEND SERVER
// This is the main server file that handles all API requests

const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

// Import route handlers
const pollRoutes = require("./routes/polls")
const participantRoutes = require("./routes/participants")
const chatRoutes = require("./routes/chat")

const app = express()
const PORT = process.env.PORT || 5000

// ⚙️ MIDDLEWARE SETUP
app.use(cors()) // Allow cross-origin requests
app.use(bodyParser.json()) // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }))

// 📡 API ROUTES
app.use("/api/polls", pollRoutes) // Poll management
app.use("/api/participants", participantRoutes) // Participant management
app.use("/api/chat", chatRoutes) // Chat functionality

// 🏥 HEALTH CHECK ENDPOINT
app.get("/api/health", (req, res) => {
  res.json({
    status: "✅ Server is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
    endpoints: {
      polls: "/api/polls",
      participants: "/api/participants",
      chat: "/api/chat",
    },
  })
})

// 🌐 ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "🎯 Live Polling System Backend",
    version: "1.0.0",
    status: "Active",
    frontend: "http://localhost:3000",
    api: `http://localhost:${PORT}/api`,
  })
})

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50))
  console.log("🚀 LIVE POLLING SYSTEM - BACKEND STARTED")
  console.log("=".repeat(50))
  console.log(`📡 Server running on: http://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🎯 API endpoints: http://localhost:${PORT}/api`)
  console.log(`🌐 Frontend should run on: http://localhost:3000`)
  console.log("=".repeat(50) + "\n")
})

// 🛑 GRACEFUL SHUTDOWN
process.on("SIGTERM", () => {
  console.log("🛑 Server shutting down gracefully...")
  process.exit(0)
})
