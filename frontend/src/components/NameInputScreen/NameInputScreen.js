"use client"

import { useState } from "react"
import "./NameInputScreen.css"

const NameInputScreen = ({ userRole, setUserName, setCurrentScreen, isLoading, fetchActivePolls, joinPoll }) => {
  const [inputValue, setInputValue] = useState("")

  const handleContinue = () => {
    if (!inputValue.trim()) return

    setUserName(inputValue.trim())

    if (userRole === "teacher") {
      setCurrentScreen("create-poll")
    } else {
      setCurrentScreen("student-waiting")
      setTimeout(() => {
        fetchActivePolls()
        joinPoll()
      }, 100)
    }
  }

  return (
    <div className="name-input-screen fade-in">
      <div className="name-input-card">
        <div className="interview-poll-badge">Intervue Poll</div>
        <h1 className="name-input-title">Let's Get Started</h1>
        <p className="name-input-subtitle">
          {userRole === "student"
            ? "If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates"
            : "You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time."}
        </p>

        <div className="form-group">
          <label className="form-label">Enter your {"Name"}</label>
          <input
            className="form-input"
            type="text"
            placeholder={ "Enter your name"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleContinue()
              }
            }}
            autoFocus
          />
          {userRole === "teacher" && <div className="character-count">{inputValue.length}/100</div>}
        </div>

        <button className="btn-primary" onClick={handleContinue} disabled={!inputValue.trim() || isLoading}>
          {isLoading ? "Loading..." :  "Continue"}
        </button>
      </div>
    </div>
  )
}

export default NameInputScreen
