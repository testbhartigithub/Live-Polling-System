"use client"
import { useState, useRef, useEffect } from "react"
import "./StudentPollScreen.css"
import "../TeacherDashboard/TeacherDashboard.css";

const StudentPollScreen = ({
  currentPoll,
  participants,
  timer,
  selectedOption,
  setSelectedOption,
  submitVote,
  isLoading,
  chatMessages,
  sendChatMessage,
  userName,
  userRole,
  userId,
}) => {
  const [showChatPopup, setShowChatPopup] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [isKicked, setIsKicked] = useState(false)
  const chatMessagesRef = useRef(null)

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  // Check if user is kicked
  useEffect(() => {
    const checkKickStatus = async () => {
      if (currentPoll?.id && userId) {
        try {
          const response = await fetch(`/api/participants/kick-status?pollId=${currentPoll.id}&userId=${userId}`)
          const data = await response.json()
          if (data.success && data.isKicked) {
            setIsKicked(true)
          }
        } catch (error) {
          console.error("Failed to check kick status:", error)
        }
      }
    }

    checkKickStatus()
    const interval = setInterval(checkKickStatus, 3000) // Check every 3 seconds
    return () => clearInterval(interval)
  }, [currentPoll?.id, userId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const success = await sendChatMessage(newMessage)
    if (success) {
      setNewMessage("")
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

  // Show kicked message if user is kicked
  if (isKicked) {
    return (
      <div className="student-poll-screen">
        <div className="kicked-message">
          <div className="kicked-card">
            <div className="kicked-icon">🚫</div>
            <h2>You have been removed from this poll</h2>
            <p>The teacher has removed you from the current polling session.</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="student-poll-screen">
      <div className="main-layout">
        <div className="main-content">
          <div className="question-header">
            <div className="header-left">
              <div className="question-title">Question {currentPoll?.questionNumber || 1}</div>
              <div className="student-info">
                <span className="student-name">👨‍🎓 {userName}</span>
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

          <div className="question-content">
            <div className="question-text">{currentPoll?.question}</div>

            <div className="instructions">
              <p>Select your answer and click Submit. You have {formatTime(timer)} remaining.</p>
            </div>

            <div className="options-container">
              {currentPoll?.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${selectedOption === index ? "selected" : ""}`}
                  onClick={() => setSelectedOption(index)}
                >
                  <div className="option-content">
                    <div className={`option-letter ${selectedOption === index ? "selected" : ""}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="option-text">{option}</div>
                    {selectedOption === index && <div className="selected-indicator">✓</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="submit-section">
              <div className="submit-info">
                {selectedOption !== null ? (
                  <p>
                    You selected: <strong>Option {String.fromCharCode(65 + selectedOption)}</strong>
                  </p>
                ) : (
                  <p>Please select an option to continue</p>
                )}
              </div>
              <button
                className="submit-btn"
                onClick={() => submitVote(selectedOption)}
                disabled={selectedOption === null || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "🚀 Submit Answer"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-header">
            <h3>👥 Participants ({participants.length})</h3>
          </div>
          <div className="sidebar-content">
            <div className="participants-container">
              {participants.length === 0 ? (
                <div className="no-participants">No other participants</div>
              ) : (
                participants.map((participant) => (
                  <div key={participant.id} className={`participant-item ${participant.role}`}>
                    <div className="participant-avatar">{participant.role === "teacher" ? "👨‍🏫" : "👨‍🎓"}</div>
                    <div className="participant-details">
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-status">
                        <span className={`role-badge ${participant.role}`}>{participant.role}</span>
                        {participant.hasVoted && participant.role === "student" && (
                          <span className="voted-badge">✓ Voted</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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

    </div>
  )
}

export default StudentPollScreen
