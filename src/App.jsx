import { useState } from "react";
import "./App.css";
import OpenAI from "openai";
import jsPDF from "jspdf";

function App() {
  const [query, setQuery] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [difficulty, setDifficulty] = useState("Easy");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQueryInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleQuestionsInputChange = (e) => {
    setTotalQuestions(e.target.value);
  };

  const handleDifficultyInputChange = (e) => {
    setDifficulty(e.target.options[e.target.selectedIndex].text);
  };

  const createQuestionsWithOpenAIApi = async () => {
    setIsLoading(true);
    const promptMessage = `Generate ${totalQuestions} ${difficulty} questions with 4 options in an array format on the topic: ${query}.
    
    Each question should be structured in JSON format with the following keys:
            - 'question': The text of the question.
            - 'options': An array of 4 options, each option as a string.
            - 'correct_option': The correct option (must match one of the options).
            - 'difficulty': The difficulty level of the question ('easy', 'medium', or 'hard').
    Output the result as an array of JSON objects with the structure described. Don't put anything else. Only valid Array.
    Example format:
    [
    {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Rome"],
        "correct_option": "Paris",
        "difficulty": "easy"
    }
    ]
    `;
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: promptMessage,
          },
        ],
        model: "gpt-4o-mini",
      });
      setIsLoading(false);
      const response = JSON.parse(chatCompletion?.choices[0]?.message?.content);
      setGeneratedQuestions(response);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setGeneratedQuestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createQuestionsWithOpenAIApi();
  };

  // Generate PDF function
  const generatePDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 10;
    const pageHeight = 280;

    generatedQuestions.forEach(({ question, options }, index) => {
      doc.setFontSize(14);
      const questionText = `${index + 1}. ${question}`;
      const splitQuestion = doc.splitTextToSize(questionText, 170);
      const questionHeight = splitQuestion.length * lineHeight;

      if (yPosition + questionHeight > pageHeight) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(splitQuestion, 20, yPosition);
      yPosition += questionHeight;

      doc.setFontSize(12);
      options.forEach((option, optionIndex) => {
        const optionText = `${optionIndex + 1}. ${option}`;
        if (yPosition + lineHeight > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(optionText, 30, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;
    });

    doc.save("generated-questions.pdf");
  };

  // Copy questions to clipboard as plain text
  const copyQuestionsAsText = () => {
    const textContent = generatedQuestions
      .map(({ question, options }, index) => {
        const optionsText = options.map((opt, optIdx) => `  ${optIdx + 1}. ${opt}`).join("\n");
        return `${index + 1}. ${question}\n${optionsText}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(textContent);
    alert("Questions copied to clipboard!");
  };

  // Download questions as a .txt file
  const downloadQuestionsAsText = () => {
    const textContent = generatedQuestions
      .map(({ question, options }, index) => {
        const optionsText = options.map((opt, optIdx) => `  ${optIdx + 1}. ${opt}`).join("\n");
        return `${index + 1}. ${question}\n${optionsText}`;
      })
      .join("\n\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated-questions.txt";
    link.click();
  };

  return (
    <div className="main-container">
      <h1 className="heading">AI Question Generator</h1>
      <div className="form-container">
        <div>
          <label htmlFor="query">Enter Topic:</label>
          <input
            placeholder="Write your topic..."
            className="input-box"
            type="text"
            id="query"
            value={query}
            onChange={handleQueryInputChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="noq">Number of Questions:</label>
          <select
            className="total-questions"
            id="noq"
            value={totalQuestions}
            onChange={handleQuestionsInputChange}
          >
            {Array.from({ length: 46 }, (_, i) => i + 5).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            className="difficulty-level"
            id="difficulty"
            value={difficulty}
            onChange={handleDifficultyInputChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <button onClick={handleSubmit} className="submit-button" disabled={!query || isLoading}>
          {isLoading ? "Generating..." : "Generate Questions"}
        </button>
        <div className="copy-download-buttons">
          <button onClick={generatePDF} className="pdf-button">
            Download as PDF
          </button>
          <button onClick={copyQuestionsAsText} className="pdf-button">
            Copy as Text
          </button>
          <button onClick={downloadQuestionsAsText} className="pdf-button">
            Download as TXT
          </button>
        </div>
      </div>

      <div className="question-list-container">
        {generatedQuestions.map(({ question, options }, index) => (
          <div key={index} className="question-list">
            <h4>
              {index + 1}. {question}
            </h4>
            <ul>
              {options.map((option, idx) => (
                <li key={idx}>
                  {idx + 1}. {option}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
