import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getExamById } from "../../../apicalls/exams";
import { addReport } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import Instructions from "./Instructions";
import Compiler from "./compiler"; // Corrected import path for Compiler component
import "./nocopy.css";

function WriteExam() {
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [result, setResult] = useState({});
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [view, setView] = useState("instructions");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const { user } = useSelector((state) => state.users);

  // Function to fetch exam data by ID
  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({ examId: params.id });
      dispatch(HideLoading());
      if (response.success) {
        // Shuffle questions array
        const shuffledQuestions = shuffleArray(response.data.questions);
        setQuestions(shuffledQuestions);
        setExamData(response.data);
        setSecondsLeft(response.data.duration);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  
  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Function to handle quiz submission
  const handleQuizSubmission = async () => {
    let correctAnswers = [];
    let wrongAnswers = [];

    questions.forEach((question, index) => {
      if (question.correctOption === selectedOptions[index]) {
        correctAnswers.push(question);
      } else {
        wrongAnswers.push(question);
      }
    });

    let totalMarks = 0;
    correctAnswers.forEach((question) => {
      totalMarks += question.marks;
    });

    let verdict = correctAnswers.length >= examData.passingMarks ? "Pass" : "Fail";

    const tempResult = {
      correctAnswers,
      wrongAnswers,
      verdict,
      totalMarks,
    };

    setResult(tempResult);

    try {
      dispatch(ShowLoading());
      const response = await addReport({
        exam: params.id,
        result: tempResult,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setView("result"); // Switch to result view after submission
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  // Function to handle coding exam submission
  const handleCodingSubmission = async (results = []) => {
    const totalPassed = results.every((result) => result);

    const tempResult = {
      correctAnswers: totalPassed ? 1 : 0,
      verdict: totalPassed ? "Pass" : "Fail",
      totalMarks: totalPassed ? questions.reduce((acc, question) => acc + question.marks, 0) : 0,
      wrongAnswers: totalPassed ? [] : questions,
    };

    setResult(tempResult);

    try {
      dispatch(ShowLoading());
      const response = await addReport({
        exam: params.id,
        result: tempResult,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setView("result"); // Switch to result view after submission
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  // Function to start the exam timer
  const startTimer = () => {
    let totalSeconds = examData.duration;
    const intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds -= 1;
        setSecondsLeft(totalSeconds);
      } else {
        setTimeUp(true);
        clearInterval(intervalId);
      }
    }, 1000);
    setIntervalId(intervalId);
  };

  // Effect to handle submission when time is up
  useEffect(() => {
    if (timeUp && view === "questions") {
      if (examData.examType === "quiz") {
        handleQuizSubmission();
      } else if (examData.examType === "coding") {
        handleCodingSubmission([]); // Pass empty results or handle accordingly
      }
    }
  }, [timeUp]);

  // Effect to fetch exam data when component mounts
  useEffect(() => {
    if (params.id) {
      getExamData();
    }
  }, []);

  return (
    examData && (
      <div className="mt-2 no-copy">
        <div className="divider"></div>
        <h1 className="text-center">{examData.name}</h1>
        <div className="divider"></div>

        {view === "instructions" && (
          <Instructions
            examData={examData}
            setView={setView}
            startTimer={startTimer}
          />
        )}

        {view === "questions" && (
          <>
            {examData.examType === "quiz" && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <h1 className="text-2xl">
                    {selectedQuestionIndex + 1} :{" "}
                    {questions[selectedQuestionIndex].name}
                  </h1>
                  <div className="timer">
                    <span className="text-2xl">{secondsLeft}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.keys(
                    questions[selectedQuestionIndex].options
                  ).map((option, index) => (
                    <div
                      className={`flex gap-2 flex-col ${
                        selectedOptions[selectedQuestionIndex] === option
                          ? "selected-option"
                          : "option"
                      }`}
                      key={index}
                      onClick={() => {
                        setSelectedOptions({
                          ...selectedOptions,
                          [selectedQuestionIndex]: option,
                        });
                      }}
                    >
                      <h1 className="text-xl">
                        {option} :{" "}
                        {
                          questions[selectedQuestionIndex].options[
                            option
                          ]
                        }
                      </h1>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {selectedQuestionIndex > 0 && (
                    <button
                      className="primary-outlined-btn"
                      onClick={() =>
                        setSelectedQuestionIndex(
                          selectedQuestionIndex - 1
                        )
                      }
                    >
                      Previous
                    </button>
                  )}
                  {selectedQuestionIndex < questions.length - 1 && (
                    <button
                      className="primary-contained-btn"
                      onClick={() =>
                        setSelectedQuestionIndex(
                          selectedQuestionIndex + 1
                        )
                      }
                    >
                      Next
                    </button>
                  )}
                  {selectedQuestionIndex ===
                    questions.length - 1 && (
                    <button
                      className="primary-contained-btn"
                      onClick={() => {
                        clearInterval(intervalId);
                        handleQuizSubmission();
                      }}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}

            {examData.examType === "coding" && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <h1 className="text-2xl">
                    {selectedQuestionIndex + 1} :{" "}
                    {questions[selectedQuestionIndex]?.name}
                  </h1>
                  <div className="timer">
                    <span className="text-2xl">{secondsLeft}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {questions[
                    selectedQuestionIndex
                  ]?.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="test-case"
                    >
                      <h3>
                        Test Case {index + 1}:
                      </h3>
                      <p>
                        Input:{" "}
                        {
                          testCase?.input
                        }
                      </p>
                      <p>
                        Expected Output:{" "}
                        {
                          testCase?.expectedOutput
                        }
                      </p>
                    </div>
                  ))}
                </div>
                <Compiler
                  testCases={
                    questions[
                      selectedQuestionIndex
                    ]?.testCases
                  }
                  onResult={(results) =>
                    handleCodingSubmission(results)
                  }
                />
                <div className="flex justify-between">
                  {selectedQuestionIndex > 0 && (
                    <button
                      className="primary-outlined-btn"
                      onClick={() =>
                        setSelectedQuestionIndex(
                          selectedQuestionIndex - 1
                        )
                      }
                    >
                      Previous
                    </button>
                  )}
                  {selectedQuestionIndex <
                    questions.length - 1 && (
                    <button
                      className="primary-contained-btn"
                      onClick={() =>
                        setSelectedQuestionIndex(
                          selectedQuestionIndex + 1
                        )
                      }
                    >
                      Next
                    </button>
                  )}
                  {selectedQuestionIndex ===
                    questions.length - 1 && (
                    <button
                      className="primary-contained-btn"
                      onClick={() => {
                        clearInterval(intervalId);
                        handleCodingSubmission();
                      }}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {view === "result" && (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl">Result</h1>
            <div className="divider"></div>

            {examData.examType === "quiz" && (
              <>
                <h1 className="text-md">
                  Total Questions: {questions.length}
                </h1>
                <h1 className="text-md">
                  Correct Answers: {result.correctAnswers.length}
                </h1>
                <h1 className="text-md">
                  Wrong Answers: {result.wrongAnswers.length}
                </h1>
                <h1 className="text-md">
                  Total Marks: {result.totalMarks}
                </h1>
                <h1 className="text-md">
                  Verdict: {result.verdict}
                </h1>
              </>
            )}

            {examData.examType === "coding" && (
              <>
                <h1 className="text-md">
                  Total Test Cases: {questions.length}
                </h1>
                <h1 className="text-md">
                  Passed: {result.correctAnswers}
                </h1>
                <h1 className="text-md">
                  Total Marks: {result.totalMarks}
                </h1>
                <h1 className="text-md">
                  Verdict: {result.verdict}
                </h1>
              </>
            )}

            <button
              className="primary-contained-btn mt-2"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    )
  );
}

export default WriteExam;
