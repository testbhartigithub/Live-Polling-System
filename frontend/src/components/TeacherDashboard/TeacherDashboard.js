"use client"

import { useState, useRef, useEffect } from "react"
import "./TeacherDashboard.css"

const TeacherDashboard = ({
  currentPoll,
  participants,
  chatMessages,
  timer,
  isTimerRunning,
  setIsTimerRunning,
  setCurrentScreen,
  setSelectedOption,
  setHasVoted,
  kickParticipant,
  sendChatMessage,
  isLoading,
  userRole,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState("results")
  const [newMessage, setNewMessage] = useState("")
  const [showChatPopup, setShowChatPopup] = useState(false)
  const [showPastPolls, setShowPastPolls] = useState(false)
  const [pastPolls, setPastPolls] = useState([])
  const [selectedPollAnalytics, setSelectedPollAnalytics] = useState(null)
  const chatMessagesRef = useRef(null)

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  // Fetch past poll results
  useEffect(() => {
    fetchPastPolls()
  }, [])

  const fetchPastPolls = async () => {
    try {
      const response = await fetch("/api/polls/history")
      const data = await response.json()
      if (data.success) {
        setPastPolls(data.pastPolls)
      }
    } catch (error) {
      console.error("Failed to fetch past polls:", error)
    }
  }

  const fetchPollAnalytics = async (pollId) => {
    try {
      const response = await fetch(`/api/polls/analytics/${pollId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedPollAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Failed to fetch poll analytics:", error)
    }
  }

  const handleNewQuestion = () => {
    setIsTimerRunning(false)
    setSelectedOption(null)
    setHasVoted(false)
    setCurrentScreen("create-poll")
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const success = await sendChatMessage(newMessage)
    if (success) {
      setNewMessage("")
    }
  }

  const handleKickParticipant = async (participantId, participantName) => {
    if (window.confirm(`Are you sure you want to remove ${participantName} from this poll?`)) {
      await kickParticipant(participantId)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timer <= 10) return "#dc3545" // Red
    if (timer <= 30) return "#fd7e14" // Orange
    return "#28a745" // Green
  }

  return (
    <div className="teacher-dashboard">
      <div className="main-layout">
        <div className="main-content">
          <div className="question-header">
            <div className="header-left">
              <div className="question-title">Question {currentPoll?.questionNumber || 1}</div>
              <div className="poll-stats">
                <span className="stat-item">👥 {participants.filter((p) => p.role === "student").length} Students</span>
                <span className="stat-item">🗳️ {currentPoll?.totalVotes || 0} Votes</span>
              </div>
            </div>
            <div className="header-right">
              <div className="question-timer" style={{ color: getTimerColor() }}>
                <svg className="timer-icon" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                </svg>
                {formatTime(timer)}
              </div>
              <button className="chat-toggle-btn" onClick={() => setShowChatPopup(!showChatPopup)} title="Toggle Chat">
                💬 Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
              </button>
            </div>
          </div>

          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === "results" ? "active" : ""}`}
              onClick={() => setActiveTab("results")}
            >
              📊 Live Results
            </button>
            <button
              className={`tab-btn ${activeTab === "participants" ? "active" : ""}`}
              onClick={() => setActiveTab("participants")}
            >
              👥 Participants ({participants.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("history")
                fetchPastPolls()
              }}
            >
              📈 Past Results ({pastPolls.length})
            </button>
          </div>

          <div className="dashboard-content">
            {activeTab === "results" && (
              <div className="results-tab">
                <div className="question-text">{currentPoll?.question}</div>

                <div className="options-container">
                  {currentPoll?.options.map((option, index) => {
                    const votes = currentPoll.votes[index] || 0
                    const percentage =
                      currentPoll.totalVotes > 0 ? Math.round((votes / currentPoll.totalVotes) * 100) : 0
                    const isCorrect = index === currentPoll.correctAnswer

                    return (
                      <div key={index} className={`option-item ${isCorrect ? "correct-answer" : ""}`}>
                        <div className="option-bar" style={{ width: `${percentage}%` }}></div>
                        <div className="option-content">
                          <div className={`option-letter ${isCorrect ? "correct" : ""}`}>
                            {String.fromCharCode(65 + index)}
                            {isCorrect && <span className="correct-icon">✓</span>}
                          </div>
                          <div className="option-text">{option}</div>
                          <div className="option-stats">
                            <span className="vote-count">{votes} votes</span>
                            <span className="option-percentage">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="poll-actions">
                  
                  <button className="btn-primary new-question-btn" onClick={handleNewQuestion} disabled={isLoading}>
                    ➕ Ask New Question
                  </button>
                </div>
              </div>
            )}

            {activeTab === "participants" && (
              <div className="participants-tab">
                <div className="participants-header">
                  <h3>Active Participants</h3>
                  <div className="participants-stats">
                    <span> Teachers: {participants.filter((p) => p.role === "teacher").length}</span>
                    <span> Students: {participants.filter((p) => p.role === "student").length}</span>
                  </div>
                </div>

                <div className="participants-list">
                  {participants.length === 0 ? (
                    <div className="no-participants">No participants yet</div>
                  ) : (
                    participants.map((participant) => (
                      <div key={participant.id} className={`participant-card ${participant.role}`}>
                        <div className="participant-info">
                          <div className="participant-avatar">{participant.role === "teacher" ? "👨‍🏫" : "👨‍🎓"}</div>
                          <div className="participant-details">
                            <div className="participant-name">{participant.name}</div>
                            <div className="participant-meta">
                              <span className={`role-badge ${participant.role}`}>{participant.role}</span>
                              {participant.hasVoted && <span className="voted-badge">✓ Voted</span>}
                              <span className="online-status">🟢 Online</span>
                            </div>
                          </div>
                        </div>
                        {participant.role !== "teacher" && (
                          <button
                            className="kick-btn"
                            onClick={() => handleKickParticipant(participant.id, participant.name)}
                            title={`Remove ${participant.name}`}
                          >
                            🚫 Remove
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="history-tab">
                <div className="history-header">
                  <h3>Past Poll Results</h3>
                  <p>View detailed analytics and results from previous polls</p>
                </div>

                <div className="past-polls-list">
                  {pastPolls.length === 0 ? (
                    <div className="no-history">
                      <div className="no-history-icon">📊</div>
                      <h4>No Past Polls</h4>
                      <p>Your completed polls will appear here with detailed analytics.</p>
                    </div>
                  ) : (
                    pastPolls.map((poll) => (
                      <div key={poll.id} className="past-poll-card">
                        <div className="poll-header">
                          <div className="poll-question">{poll.question}</div>
                          <div className="poll-date">
                            {new Date(poll.createdAt).toLocaleDateString()} at{" "}
                            {new Date(poll.createdAt).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* <div className="poll-stats-grid">
                          <div className="stat-card">
                            <div className="stat-value">{poll.totalVotes}</div>
                            <div className="stat-label">Total Votes</div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-value">{poll.participationRate}%</div>
                            <div className="stat-label">Participation</div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-value">{poll.correctAnswerPercentage}%</div>
                            <div className="stat-label">Correct Answers</div>
                          </div>
                          <div className="stat-card">
                            <div className="stat-value">{poll.averageResponseTime}s</div>
                            <div className="stat-label">Avg Response Time</div>
                          </div>
                        </div> */}

                        <div className="poll-options-summary">
                          {poll.options.map((option, index) => {
                            const percentage =
                              poll.totalVotes > 0 ? Math.round((poll.votes[index] / poll.totalVotes) * 100) : 0
                            const isCorrect = index === poll.correctAnswer

                            return (
                              <div key={index} className={`option-summary ${isCorrect ? "correct" : ""}`}>
                                <span className="option-label">
                                  {String.fromCharCode(65 + index)}. {option}
                                  {isCorrect && " ✓"}
                                </span>
                                <span className="option-result">
                                  {percentage}% ({poll.votes[index]} votes)
                                </span>
                              </div>
                            )
                          })}
                        </div>

              
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Popup */}
      {showChatPopup && (
        <div className="chat-popup">
          <div className="chat-popup-header">
            <h4>💬 Live Chat</h4>
            <button className="close-chat" onClick={() => setShowChatPopup(false)}>
              ×
            </button>
          </div>
          <div className="chat-popup-content">
            <div className="chat-messages" ref={chatMessagesRef}>
              {chatMessages.length === 0 ? (
                <div className="no-messages">Start the conversation! 👋</div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`chat-message ${message.userRole}`}>
                    <div className="message-header">
                      <span className="message-author">
                        {message.userRole === "teacher" ? "👨‍🏫" : "👨‍🎓"} {message.user}
                      </span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <div className="message-text">{message.message}</div>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input-container">
              <input
                className="chat-input"
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                maxLength={500}
              />
              <button className="chat-send-btn" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      
    </div>
  )
}

export default TeacherDashboard
