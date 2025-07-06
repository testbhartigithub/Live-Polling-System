// 📊 ENHANCED DATA STORAGE SYSTEM
// This file manages all data in memory with enhanced features

let questionCounter = 1

class PollStorageSystem {
  constructor() {
    // 🗃️ DATA CONTAINERS
    this.polls = [] // All created polls (including past results)
    this.activePoll = null // Currently active poll
    this.participants = new Map() // Poll participants
    this.chatMessages = new Map() // Chat messages per poll
    this.votedUsers = new Map() // Track who voted
    this.liveConnections = new Set() // Active user sessions
    this.kickedUsers = new Map() // Track kicked users per poll

    console.log("🗃️ Enhanced Poll Storage System Initialized")
  }

  // 🎯 POLL MANAGEMENT
  createPoll(pollData) {
    const pollId = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newPoll = {
      id: pollId,
      question: pollData.question,
      options: pollData.options,
      correctAnswer: pollData.correctAnswer || 0,
      timeLimit: pollData.timeLimit || 60, // Configurable time limit
      votes: new Array(pollData.options.length).fill(0),
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      createdBy: pollData.createdBy,
      createdById: pollData.createdById,
      isActive: true,
      status: "active",
      startTime: Date.now(),
      endTime: null,
      questionNumber: questionCounter++,
      // Enhanced poll data
      participantCount: 0,
      votingDetails: [], // Store individual votes for analysis
      duration: null, // Actual poll duration
    }

    // End previous poll if exists
    if (this.activePoll) {
      this.activePoll.isActive = false
      this.activePoll.status = "completed"
      this.activePoll.endTime = Date.now()
      this.activePoll.duration = this.activePoll.endTime - this.activePoll.startTime
    }

    this.polls.push(newPoll)
    this.activePoll = newPoll

    // Initialize data containers for new poll
    this.participants.set(pollId, [])
    this.chatMessages.set(pollId, this.chatMessages.get(this.activePoll?.id) || [])
    this.votedUsers.set(pollId, new Set())
    this.kickedUsers.set(pollId, new Set()) // Initialize kicked users tracking

    console.log(`✅ Poll created: ${pollId}`)
    console.log(`📊 Question ${questionCounter - 1}: ${pollData.question}`)
    console.log(`⏰ Time limit: ${pollData.timeLimit} seconds`)

    return newPoll
  }

  getActivePoll() {
    return this.activePoll
  }

  getAllPolls() {
    return this.polls
  }

  // 📈 GET PAST POLL RESULTS (Enhanced for teacher dashboard)
  getPastPolls() {
    return this.polls
      .filter((poll) => !poll.isActive)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((poll) => ({
        ...poll,
        participantCount: this.getParticipants(poll.id).length,
        participationRate:
          poll.totalVotes > 0
            ? Math.round(
                (poll.totalVotes /
                  Math.max(this.getParticipants(poll.id).filter((p) => p.role === "student").length, 1)) *
                  100,
              )
            : 0,
        correctAnswerPercentage:
          poll.totalVotes > 0 ? Math.round((poll.votes[poll.correctAnswer] / poll.totalVotes) * 100) : 0,
        averageResponseTime: this.calculateAverageResponseTime(poll.id),
      }))
  }

  getPollById(id) {
    return this.polls.find((poll) => poll.id === id)
  }

  // 🏁 END POLL
  endCurrentPoll() {
    if (this.activePoll) {
      this.activePoll.isActive = false
      this.activePoll.status = "completed"
      this.activePoll.endTime = Date.now()
      this.activePoll.duration = this.activePoll.endTime - this.activePoll.startTime
      this.activePoll.participantCount = this.getParticipants(this.activePoll.id).length

      console.log(`🏁 Poll ended: ${this.activePoll.id}`)
      console.log(`⏱️ Duration: ${Math.round(this.activePoll.duration / 1000)} seconds`)

      const previousPoll = this.activePoll
      this.activePoll = null
      return previousPoll
    }
    return null
  }

  // 🗳️ ENHANCED VOTING SYSTEM
  addVote(pollId, optionIndex, userId, userName) {
    const poll = this.getPollById(pollId)
    if (!poll) throw new Error("Poll not found")
    if (!poll.isActive) throw new Error("Poll is no longer active")

    // Check if user is kicked
    const kickedSet = this.kickedUsers.get(pollId)
    if (kickedSet && kickedSet.has(userId)) {
      throw new Error("You have been removed from this poll")
    }

    const votedSet = this.votedUsers.get(pollId)
    if (votedSet.has(userId)) throw new Error("User has already voted")

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error("Invalid option selected")
    }

    // Record the vote with timestamp
    poll.votes[optionIndex]++
    poll.totalVotes++
    votedSet.add(userId)

    // Store detailed voting information
    if (!poll.votingDetails) poll.votingDetails = []
    poll.votingDetails.push({
      userId,
      userName,
      optionIndex,
      optionText: poll.options[optionIndex],
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - poll.startTime,
      isCorrect: optionIndex === poll.correctAnswer,
    })

    console.log(`🗳️ Vote recorded: ${userName} → "${poll.options[optionIndex]}"`)
    return poll
  }

  // 👥 ENHANCED PARTICIPANT MANAGEMENT
  addParticipant(pollId, participant) {
    // Check if user is kicked
    const kickedSet = this.kickedUsers.get(pollId)
    if (kickedSet && kickedSet.has(participant.id)) {
      throw new Error("You have been removed from this poll")
    }

    if (!this.participants.has(pollId)) {
      this.participants.set(pollId, [])
    }

    const participants = this.participants.get(pollId)
    const existingIndex = participants.findIndex((p) => p.id === participant.id)

    if (existingIndex !== -1) {
      // Update existing participant
      participants[existingIndex] = {
        ...participants[existingIndex],
        isOnline: true,
        lastSeen: new Date().toISOString(),
        hasVoted: this.hasUserVoted(pollId, participant.id),
      }
    } else {
      // Add new participant
      const newParticipant = {
        ...participant,
        isOnline: true,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        hasVoted: false,
      }
      participants.push(newParticipant)
      console.log(`👥 New participant: ${participant.name} (${participant.role})`)
    }

    this.liveConnections.add(participant.id)
    return participants
  }

  getParticipants(pollId) {
    return this.participants.get(pollId) || []
  }

  // 🚫 KICK PARTICIPANT FUNCTIONALITY
  kickParticipant(pollId, participantId) {
    const participants = this.participants.get(pollId) || []
    const participant = participants.find((p) => p.id === participantId)

    if (!participant) {
      throw new Error("Participant not found")
    }

    if (participant.role === "teacher") {
      throw new Error("Cannot kick a teacher")
    }

    // Add to kicked users list
    if (!this.kickedUsers.has(pollId)) {
      this.kickedUsers.set(pollId, new Set())
    }
    this.kickedUsers.get(pollId).add(participantId)

    // Remove from participants
    const updated = participants.filter((p) => p.id !== participantId)
    this.participants.set(pollId, updated)
    this.liveConnections.delete(participantId)

    console.log(`🚫 Participant kicked: ${participant.name}`)
    return {
      participants: updated,
      kickedParticipant: participant,
    }
  }

  // Check if user is kicked
  isUserKicked(pollId, userId) {
    const kickedSet = this.kickedUsers.get(pollId)
    return kickedSet ? kickedSet.has(userId) : false
  }

  removeParticipant(pollId, participantId) {
    const participants = this.participants.get(pollId) || []
    const updated = participants.filter((p) => p.id !== participantId)
    this.participants.set(pollId, updated)
    this.liveConnections.delete(participantId)
    return updated
  }

  hasUserVoted(pollId, userId) {
    const votedSet = this.votedUsers.get(pollId)
    return votedSet ? votedSet.has(userId) : false
  }

  // 💬 ENHANCED CHAT SYSTEM
  addMessage(pollId, messageData) {
    if (!this.chatMessages.has(pollId)) {
      this.chatMessages.set(pollId, [])
    }

    const messages = this.chatMessages.get(pollId)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

    const newMessage = {
      id: messageId,
      user: messageData.user,
      message: messageData.message,
      timestamp: messageData.timestamp,
      createdAt: new Date().toISOString(),
      type: messageData.type || "text",
      userRole: messageData.userRole || "student", // Track user role for styling
    }

    messages.push(newMessage)

    // Keep only last 200 messages for performance
    if (messages.length > 200) {
      messages.shift()
    }

    console.log(`💬 Message from ${messageData.user} (${messageData.userRole}): "${messageData.message}"`)
    return newMessage
  }

  getMessages(pollId) {
    return this.chatMessages.get(pollId) || []
  }

  // 📊 ANALYTICS FUNCTIONS
  calculateAverageResponseTime(pollId) {
    const poll = this.getPollById(pollId)
    if (!poll || !poll.votingDetails || poll.votingDetails.length === 0) {
      return 0
    }

    const totalTime = poll.votingDetails.reduce((sum, vote) => sum + vote.responseTime, 0)
    return Math.round(totalTime / poll.votingDetails.length / 1000) // Convert to seconds
  }

  getPollAnalytics(pollId) {
    const poll = this.getPollById(pollId)
    if (!poll) return null

    const participants = this.getParticipants(pollId)
    const students = participants.filter((p) => p.role === "student")

    return {
      pollId: poll.id,
      question: poll.question,
      totalVotes: poll.totalVotes,
      totalStudents: students.length,
      participationRate: students.length > 0 ? Math.round((poll.totalVotes / students.length) * 100) : 0,
      correctAnswerRate: poll.totalVotes > 0 ? Math.round((poll.votes[poll.correctAnswer] / poll.totalVotes) * 100) : 0,
      averageResponseTime: this.calculateAverageResponseTime(pollId),
      optionBreakdown: poll.options.map((option, index) => ({
        option,
        votes: poll.votes[index],
        percentage: poll.totalVotes > 0 ? Math.round((poll.votes[index] / poll.totalVotes) * 100) : 0,
        isCorrect: index === poll.correctAnswer,
      })),
      votingDetails: poll.votingDetails || [],
    }
  }

  // 📈 SYSTEM STATISTICS
  getSystemStats() {
    const totalPolls = this.polls.length
    const activePolls = this.polls.filter((p) => p.isActive).length
    const completedPolls = this.polls.filter((p) => !p.isActive).length

    return {
      totalPolls,
      activePolls,
      completedPolls,
      totalParticipants: Array.from(this.participants.values()).reduce(
        (sum, participants) => sum + participants.length,
        0,
      ),
      liveConnections: this.liveConnections.size,
      totalMessages: Array.from(this.chatMessages.values()).reduce((sum, messages) => sum + messages.length, 0),
      averagePollDuration: this.calculateAveragePollDuration(),
      mostActiveHour: this.getMostActiveHour(),
    }
  }

  calculateAveragePollDuration() {
    const completedPolls = this.polls.filter((p) => p.duration)
    if (completedPolls.length === 0) return 0

    const totalDuration = completedPolls.reduce((sum, poll) => sum + poll.duration, 0)
    return Math.round(totalDuration / completedPolls.length / 1000) // Convert to seconds
  }

  getMostActiveHour() {
    const hours = {}
    this.polls.forEach((poll) => {
      const hour = new Date(poll.createdAt).getHours()
      hours[hour] = (hours[hour] || 0) + 1
    })

    const mostActive = Object.entries(hours).reduce(
      (max, [hour, count]) => (count > max.count ? { hour: Number.parseInt(hour), count } : max),
      { hour: 0, count: 0 },
    )

    return mostActive.hour
  }
}

// 🌟 CREATE GLOBAL INSTANCE
const storage = new PollStorageSystem()
module.exports = storage
