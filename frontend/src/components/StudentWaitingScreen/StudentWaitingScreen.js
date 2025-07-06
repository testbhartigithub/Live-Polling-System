import "./StudentWaitingScreen.css"

const StudentWaitingScreen = () => {
  return (
    <div className="student-waiting fade-in">
      <div className="waiting-card">
        <div className="interview-poll-badge">Intervue Poll</div>
        <div className="loading-spinner"></div>
        <h2 className="waiting-title">Wait for the teacher to ask questions..</h2>
      </div>
    </div>
  )
}

export default StudentWaitingScreen
