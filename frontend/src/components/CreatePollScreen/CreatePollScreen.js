"use client"

import { useState } from "react"
import "./CreatePollScreen.css"

const CreatePollScreen = ({ createPoll, isLoading }) => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [timeLimit, setTimeLimit] = useState(60) // Default 60 seconds

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      // Adjust correct answer if needed
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(0)
      }
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = () => {
    const validOptions = options.filter((opt) => opt.trim())
    if (validOptions.length < 2) return

    const pollData = {
      question: question.trim(),
      options: validOptions,
      correctAnswer,
      timeLimit, // Include configurable time limit
    }
    createPoll(pollData)
  }

  return (
    <div className="create-poll-container">
      <div className="create-poll-card fade-in">
        <div className="interview-poll-badge">Intervue Poll</div>
        <div className="create-poll-header">
          <h1 className="create-poll-title">Create New Poll</h1>
          <p className="create-poll-subtitle">
            Create engaging polls with customizable time limits and track real-time responses from your students.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Poll Question *</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Enter your poll question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
          />
          <div className="character-count">{question.length}/200</div>
        </div>

        {/* Time Limit Configuration */}
        <div className="form-group">
          <label className="form-label">Time Limit (seconds) *</label>
          <div className="time-limit-container">
            <input
              type="range"
              min="10"
              max="120"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number.parseInt(e.target.value))}
              className="time-slider"
            />
            <div className="time-display">
              <span className="time-value">{timeLimit}s</span>
              <span className="time-description">
                {timeLimit < 30 ? "Quick Poll" : timeLimit < 120 ? "Standard Poll" : "Extended Poll"}
              </span>
            </div>
          </div>
          <div className="time-presets">
            <button
              type="button"
              className={`time-preset ${timeLimit === 30 ? "active" : ""}`}
              onClick={() => setTimeLimit(30)}
            >
              30s
            </button>
            <button
              type="button"
              className={`time-preset ${timeLimit === 60 ? "active" : ""}`}
              onClick={() => setTimeLimit(60)}
            >
              60s
            </button>
            <button
              type="button"
              className={`time-preset ${timeLimit === 90 ? "active" : ""}`}
              onClick={() => setTimeLimit(90)}
            >
              90s
            </button>
          </div>
        </div>

        <div className="options-section">
          <label className="form-label">Answer Options *</label>

          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <div className="option-number">{String.fromCharCode(65 + index)}</div>
              <input
                className="form-input option-input"
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                maxLength={100}
              />
              <div className="correct-answer-group">
                <div
                  className={`correct-answer-radio ${correctAnswer === index ? "selected" : ""}`}
                  onClick={() => setCorrectAnswer(index)}
                  title="Mark as correct answer"
                />
                <span className="correct-label">{correctAnswer === index ? "Correct" : "Incorrect"}</span>
              </div>
              {options.length > 2 && (
                <button
                  type="button"
                  className="remove-option-btn"
                  onClick={() => removeOption(index)}
                  title="Remove option"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button className="add-option-btn" onClick={addOption} disabled={options.length >= 6}>
            + Add Another Option ({options.length}/6)
          </button>
        </div>

        {/* <div className="poll-summary">
          <h3>Poll Summary</h3>
          <div className="summary-item">
            <span>Question:</span>
            <span>{question || "Not set"}</span>
          </div>
          <div className="summary-item">
            <span>Options:</span>
            <span>{options.filter((opt) => opt.trim()).length} options</span>
          </div>
          <div className="summary-item">
            <span>Correct Answer:</span>
            <span>Option {String.fromCharCode(65 + correctAnswer)}</span>
          </div>
          <div className="summary-item">
            <span>Time Limit:</span>
            <span>{timeLimit} seconds</span>
          </div>
        </div> */}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!question.trim() || options.filter((opt) => opt.trim()).length < 2 || isLoading}
        >
          {isLoading ? "Creating Poll..." : "🚀 Launch Poll"}
        </button>
      </div>
    </div>
  )
}

export default CreatePollScreen
