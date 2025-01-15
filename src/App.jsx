import { useState } from "react"
import "./App.css"

function App() {
  const [query, setQuery] = useState("")
  const [totalQuestions, setTotalQuestions] = useState(1)
  const [difficulty, setDifficulty] = useState("")

  const handleQueryInputChange = (e) => {
    setQuery(e.target.value);
    
  }

  const handleQuestionsInputChange = (e) => {
    setTotalQuestions(e.target.value);
  }


  const handleDifficultyInputChange = (e) => {
    setDifficulty(e.target.value);
    
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(query);
    console.log(totalQuestions);
    console.log(difficulty);  
  }

  return (
    <>
      <div className="main-container">
        <h1 className="heading">AI Question Generator</h1>
        <div className="form-container">
          <div>
            <label htmlFor="query">Enter Query: </label>
            <input
              placeholder=" write you topic..."
              className="input-box"
              type="text"
              name=""
              id="query"
              onChange={handleQueryInputChange}
            />
          </div>
          <div className="question-container">
            <label htmlFor="noq">No of Questions</label>
            <input
              max={50}
              min={5}
              className="total-questions"
              id="noq"
              type="range"
              onChange={handleQuestionsInputChange}
            />
          </div>
          <div>
            <label className="level" htmlFor="difficulty">
              Difficulty
            </label>
            <select className="difficulty-level" id="difficulty"
            onChange={handleDifficultyInputChange}>
              <option value="0">Choose level</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </select>
          </div>
          <button onClick={handleSubmit} className="submit-button">Generate Questions</button>
        </div>
      </div>
    </>
  )
}

export default App
