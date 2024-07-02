import React, { useState, useEffect, useRef } from "react";
import { message, Button } from "antd";
import * as monaco from "monaco-editor";

const Compiler = ({ testCases, onResult, onSubmissionResult, startExam }) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const editorRef = useRef(null);

  // Function to reset the state of the Compiler component
  const resetCompiler = () => {
    setInput("");
    setOutput("");
    setUserInput("");
    setSubmissionResult(null);

    // Dispose the editor instance if it exists
    if (editorRef.current) {
      editorRef.current.setValue("");
    }
  };

  useEffect(() => {
    resetCompiler();
  }, [startExam]); // Reset state when startExam changes

  useEffect(() => {
    localStorage.setItem("input", input);
  }, [input]);

  useEffect(() => {
    editorRef.current = monaco.editor.create(document.getElementById("codeEditor"), {
      value: input,
      language: "javascript",
      theme: "vs-dark",
    });

    editorRef.current.onDidChangeModelContent(() => {
      setInput(editorRef.current.getValue());
    });

    return () => {
      editorRef.current.dispose();
    };
  }, []);

  const runCode = () => {
    try {
      const ws = new WebSocket("ws://localhost:8765");

      ws.onopen = () => {
        const data = {
          code: editorRef.current.getValue(),
          stdin: userInput,
        };

        ws.send(JSON.stringify(data));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          if (response.error) {
            message.error(`Error: ${response.error}`);
          } else if (response.output) {
            let decodedOutput;
            try {
              decodedOutput = atob(response.output);
            } catch (error) {
              message.error("Failed to decode output.");
              return;
            }
            setOutput(decodedOutput);

            // Compare the actual output with expected outputs from test cases
            const results = testCases.map((testCase) => {
              const actualOutput = decodedOutput.trim();
              const expectedOutput = testCase.trim();
              return actualOutput === expectedOutput;
            });

            // Pass the results back to the parent component
            onResult(results);

            // Determine submission result (Pass or Fail)
            const isAllCorrect = results.every((result) => result);
            setSubmissionResult(isAllCorrect ? "Pass" : "Fail");
            // Pass the submission result to the parent component
            onSubmissionResult(isAllCorrect ? "Pass" : "Fail");
          } else if (response.compilation_error) {
            const compilationError = atob(response.compilation_error);
            message.error(`Compilation Error: ${compilationError}`);
          }
        } catch (error) {
          message.error("Error processing server response.");
        }
      };

      ws.onerror = (error) => {
        message.error("WebSocket Error occurred.");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };
    } catch (error) {
      message.error("Error occurred while compiling or executing the code.");
    }
  };

  const handleUserInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = () => {
    // Handle submission logic based on submissionResult state
    if (submissionResult === "Pass") {
      message.success("All test cases passed!");
      // Additional logic for passing the exam can be added here
    } else {
      message.error("Test cases did not pass. Please review your solution.");
      // Additional logic for failing the exam can be added here
    }
  };

  return (
    <div className="compiler">
      <div className="row container-fluid">
        <div className="col-6 ml-4">
          <label htmlFor="solution">
            <span className="badge badge-info heading mt-2">
              <i className="fas fa-code fa-fw fa-lg"></i> Code Here
            </span>
          </label>
          <div id="codeEditor" style={{ height: "400px" }}></div>

          <Button type="primary" onClick={runCode} className="ml-2 mr-2">
            <i className="fas fa-cog fa-fw"></i> Run
          </Button>

          <Button type="primary" onClick={handleSubmit} className="ml-2">
            Submit
          </Button>
        </div>
        <div className="col-5">
          <div>
            <span className="badge badge-info heading my-2">
              <i className="fas fa-exclamation fa-fw fa-md"></i> Output
            </span>
            <textarea
              id="output"
              className="output"
              value={output}
              readOnly
              style={{ width: "100%", height: "200px" }}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="mt-2 ml-5">
        <span className="badge badge-primary heading my-2">
          <i className="fas fa-user fa-fw fa-md"></i> User Input
        </span>
        <br />
        <textarea
          id="input"
          onChange={handleUserInputChange}
          value={userInput}
          style={{ width: "100%", height: "100px" }}
        ></textarea>
      </div>
    </div>
  );
};

export default Compiler;
