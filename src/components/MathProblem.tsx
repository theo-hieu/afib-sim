import { useState, useEffect, useRef } from "react";

type MathProblemProps = {
  isAfib: boolean;
  score: number;
  onCorrect: () => void;
  onWrong: () => void;
  onTimeout: () => void;
};

export function MathProblem({
  isAfib,
  score,
  onCorrect,
  onWrong,
  onTimeout,
}: MathProblemProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState("+");
  const [answer, setAnswer] = useState("");
  const [errorShake, setErrorShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateProblem = () => {
    const difficultyLevel = Math.floor(score / 100);
    const ops = ["+", "-", "*"];
    const selectedOp = ops[Math.floor(Math.random() * ops.length)];
    setOperator(selectedOp);

    // increase difficulty slightly based on afib and score
    const baseMax = isAfib ? 20 : 10;
    const max = baseMax + difficultyLevel * 5;

    setNum1(Math.floor(Math.random() * max) + 1);
    setNum2(Math.floor(Math.random() * max) + 1);
    setAnswer("");

    // Decrease time by 0.5s for every difficulty tier (1 tier = score of 100)
    const baseTime = isAfib ? 4 : 10;
    const allowedTime = Math.max(2, baseTime - Math.floor(difficultyLevel / 2));
    setTimeLeft(allowedTime);
  };

  useEffect(() => {
    generateProblem();
  }, [isAfib]);

  // Handle ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeout();
          setErrorShake(true);
          setTimeout(() => setErrorShake(false), 400);

          setTimeout(() => generateProblem(), 0); // Generate problem outside state updater cycle
          const difficultyLevel = Math.floor(score / 100);
          const baseTime = isAfib ? 4 : 10;
          return Math.max(2, baseTime - Math.floor(difficultyLevel / 2));
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAfib, onTimeout, score]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correctAns = 0;
    if (operator === "+") correctAns = num1 + num2;
    if (operator === "-") correctAns = num1 - num2;
    if (operator === "*") correctAns = num1 * num2;

    if (parseInt(answer) === correctAns) {
      onCorrect();
      generateProblem();
    } else {
      if (answer !== "") onWrong();
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 400);
      setAnswer("");
    }

    // Attempting to regain focus on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`glass-panel ${errorShake ? "shake-element" : ""}`}
      style={{ width: "100%", maxWidth: "400px", position: "relative" }}
    >
      {/* Ticking Clock visual */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 15,
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: timeLeft <= 3 ? "var(--error)" : "var(--text-muted)",
        }}
      >
        {timeLeft}s
      </div>

      <h2
        style={{
          fontSize: "1.2rem",
          marginBottom: "1rem",
          color: "var(--text-muted)",
        }}
      >
        Solve to maintain focus:
      </h2>
      <div
        className={isAfib ? "jitter-text glitch" : ""}
        style={{
          fontSize: "3rem",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "1.5rem",
          letterSpacing: "-2px",
        }}
      >
        {isAfib ? (Math.random() > 0.6 ? String(num1) + "?" : num1) : num1}{" "}
        {isAfib && Math.random() > 0.8
          ? operator === "+"
            ? "*"
            : "+"
          : operator}{" "}
        {isAfib ? (Math.random() > 0.6 ? String(num2) + "!" : num2) : num2}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ position: "relative", width: "100%" }}
      >
        <input
          ref={inputRef}
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "0.75rem",
            paddingRight: "5rem", // Make room for the button
            color: "white",
            fontSize: "1.2rem",
            fontFamily: "JetBrains Mono, monospace",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "6px",
            padding: "0.4rem 1rem",
            fontSize: "0.9rem",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
