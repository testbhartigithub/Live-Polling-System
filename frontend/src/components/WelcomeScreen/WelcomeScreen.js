"use client"
import "./WelcomeScreen.css"

const WelcomeScreen = ({ userRole, setUserRole, setCurrentScreen, isLoading }) => {
  return (
    <div className="welcome-screen fade-in">
      <div className="welcome-card">
        <div className="interview-poll-badge">Intervue Poll</div>
        <h1 className="welcome-title">Welcome to the Live Polling System</h1>
        <p className="welcome-subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-selection">
          <div
            className={`role-option ${userRole === "student" ? "selected" : ""}`}
            onClick={() => setUserRole("student")}
          >
            <div className="role-title">I'm a Student</div>
            <div className="role-description">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </div>
          </div>

          <div
            className={`role-option ${userRole === "teacher" ? "selected" : ""}`}
            onClick={() => setUserRole("teacher")}
          >
            <div className="role-title">I'm a Teacher</div>
            <div className="role-description">Submit answers and view live poll results in real-time</div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setCurrentScreen("name-input")}
          disabled={!userRole || isLoading}
        >
          {isLoading ? "Loading..." : "Continue"}
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen
