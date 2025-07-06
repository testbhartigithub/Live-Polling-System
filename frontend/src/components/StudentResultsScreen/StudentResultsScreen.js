"use client"

import { useState, useRef, useEffect } from "react"
import "./StudentResultsScreen.css"

const StudentResultsScreen = ({ currentPoll, participants, chatMessages, selectedOption, sendChatMessage }) => {
  const [activeTab, setActiveTab] = useState("chat")
  const [newMessage, setNewMessage] = useState("")
  const chatMessagesRef = useRef(null)

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const success = await sendChatMessage(newMessage)
    if (success) {
      setNewMessage("")
    }
  }

  return (
    <div className="student-results-screen">
      <div className="main-layout">
        <div className="main-content">
          <div className="question-header">
            <div className="question-title">Question 1</div>
            <div className="question-timer">
              <svg className="timer-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
              </svg>
              00:15
            </div>
          </div>

          <div className="question-content">
            <div className="question-text">{currentPoll?.question}</div>

            <div className="options-container">
              {currentPoll?.options.map((option, index) => {
                const votes = currentPoll.votes[index] || 0
                const percentage = currentPoll.totalVotes > 0 ? Math.round((votes / currentPoll.totalVotes) * 100) : 0

                return (
                  <div key={index} className="option-item">
                    <div className="option-bar" style={{ width: `${percentage}%` }}></div>
                    <div className="option-content">
                      <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                      <div className="option-text">{option}</div>
                      <div className="option-percentage">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="wait-message">
              <p>Wait for the teacher to ask a new question</p>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-tabs">
            <div className={`sidebar-tab ${activeTab === "chat" ? "active" : ""}`} onClick={() => setActiveTab("chat")}>
              Chat
            </div>
            <div
              className={`sidebar-tab ${activeTab === "participants" ? "active" : ""}`}
              onClick={() => setActiveTab("participants")}
            >
              Participants
            </div>
          </div>

          <div className="sidebar-content">
            {activeTab === "chat" ? (
              <div className="chat-container">
                <div className="chat-messages" ref={chatMessagesRef}>
                  {chatMessages.map((message) => (
                    <div key={message.id} className="chat-message">
                      <div className="message-header">
                        <div className="message-author">{message.user}</div>
                        <div className="message-time">{message.timestamp}</div>
                      </div>
                      <div className="message-text">{message.message}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-container">
                  <input
                    className="chat-input"
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button className="chat-send-btn" onClick={handleSendMessage}>
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="participants-container">
                <div className="participants-header">Name</div>
                {participants.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-name">{participant.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentResultsScreen
