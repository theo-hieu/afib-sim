import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Brain, HeartPulse } from "lucide-react";
import { MathProblem } from "./components/MathProblem";
import { BreathingMeter } from "./components/BreathingMeter";
import { AfibDisturbances } from "./components/AfibDisturbances";
import { heartbeatAudio } from "./utils/audio";
import "./index.css";

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isDead, setIsDead] = useState(false);

  // Game state
  const [isAfib, setIsAfib] = useState(false);
  const [oxygen, setOxygen] = useState(100);
  const [score, setScore] = useState(0);
  const [timeActive, setTimeActive] = useState(0);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Fake Cursor State
  // Real mouse position
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  // Delayed cursor position
  const [cursorPos, setCursorPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Start the simulation
  const startGame = () => {
    setIsStarted(true);
    setIsDead(false);
    setOxygen(100);
    setScore(0);
    setTimeActive(0);
    setIsAfib(false);
    heartbeatAudio.start(false); // normal beat
  };

  const restart = () => {
    heartbeatAudio.stop();
    startGame();
  };

  // Main game loop (oxygen & afib triggers)
  useEffect(() => {
    if (!isStarted || isDead) return;

    const loop = setInterval(() => {
      setTimeActive((prev) => {
        const nextTime = prev + 0.5;
        if (!isAfib && nextTime > 10 && Math.random() < 0.03) {
          triggerAfib();
        }
        return nextTime;
      });

      setOxygen((prev) => {
        const dropRate = isAfib ? 6 : 1; // Faster drop rate during afib to induce panic
        const newO2 = prev - dropRate;
        if (newO2 <= 0) {
          die();
          return 0;
        }
        return newO2;
      });
    }, 500);

    return () => clearInterval(loop);
  }, [isStarted, isDead, isAfib]);

  // Handle Spacebar (Breathing)
  useEffect(() => {
    if (!isStarted || isDead) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setOxygen((prev) => Math.min(100, prev + (isAfib ? 3 : 5)));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStarted, isDead, isAfib]);

  // Handle Delayed Cursor and Body Class
  useEffect(() => {
    if (isAfib) {
      document.body.classList.add("afib-cursor-none");
    } else {
      document.body.classList.remove("afib-cursor-none");
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMouseMove);

    let animationFrameId: number;
    const animateCursor = () => {
      if (isAfib) {
        setCursorPos((prev) => {
          // Linear interpolation for that "drunk/laggy" feel
          const dx = mouseRef.current.x - prev.x;
          const dy = mouseRef.current.y - prev.y;
          // Add random jitter to make it impossible to point accurately
          const jitterX = (Math.random() - 0.5) * 15;
          const jitterY = (Math.random() - 0.5) * 15;

          return {
            x: prev.x + dx * 0.15 + jitterX,
            y: prev.y + dy * 0.15 + jitterY,
          };
        });
      }
      animationFrameId = requestAnimationFrame(animateCursor);
    };

    if (isStarted && !isDead) {
      animateCursor();
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
      document.body.classList.remove("afib-cursor-none");
    };
  }, [isAfib, isStarted, isDead]);

  // Evasive Target Movement
  useEffect(() => {
    if (!isAfib || !targetPos) return;

    // Target moves away/randomly every 1.5 seconds, making it hard to click
    const moveTimer = setInterval(() => {
      spawnTarget();
    }, 1500);

    return () => clearInterval(moveTimer);
  }, [isAfib, targetPos]);

  const triggerAfib = () => {
    setIsAfib(true);
    heartbeatAudio.start(true); // Afib fast, irregular sound, ringing, muffled
    spawnTarget(); // Initial target
  };

  const die = () => {
    setIsDead(true);
    heartbeatAudio.stop();
  };

  // Target clicking (panic response)
  const spawnTarget = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * (rect.width - 60);
      const y = Math.random() * (rect.height - 60);
      setTargetPos({ x, y });
    }
  };

  const handleTargetClick = () => {
    setOxygen((prev) => Math.min(100, prev + 25)); // huge oxygen boost

    if (Math.random() < 0.3) {
      setIsAfib(false);
      setTargetPos(null);
      heartbeatAudio.start(false); // back to normal
    } else {
      spawnTarget();
    }
  };

  const penaltyScore = useCallback(() => {
    setOxygen((prev) => Math.max(0, prev - 25)); // Big penalty for timeout
  }, []);

  if (!isStarted) {
    return (
      <div
        className="glass-panel"
        style={{ textAlign: "center", maxWidth: "500px" }}
      >
        <HeartPulse
          size={64}
          color="var(--error)"
          style={{ margin: "0 auto 1.5rem auto" }}
        />
        <h1 style={{ marginBottom: "1rem", fontSize: "2rem" }}>
          Afib Simulation
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          This prototype simulates the severe cognitive load, loss of motor
          control, and sensory overload of an Atrial Fibrillation episode.
        </p>
        <div
          style={{
            textAlign: "left",
            background: "rgba(0,0,0,0.3)",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "var(--accent)" }}>
            Instructions:
          </h3>
          <ul
            style={{
              marginLeft: "1.5rem",
              color: "var(--text-muted)",
              lineHeight: "1.8",
            }}
          >
            <li>
              Solve the math problems quickly.{" "}
              <strong>Timeouts penalize oxygen heavily.</strong>
            </li>
            <li>
              Press <strong>SPACEBAR</strong> continuously to "breathe".
            </li>
            <li>
              If your heart rate spikes, you will experience{" "}
              <strong>motor impairment</strong> and sensory changes.
            </li>
            <li>Click the evasive red nodes to stabilize.</li>
          </ul>
        </div>
        <button
          onClick={startGame}
          style={{
            background: "var(--accent)",
            color: "#fff",
            fontSize: "1.2rem",
            fontWeight: 600,
            padding: "1rem 3rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px var(--accent-glow)",
            cursor: "pointer",
          }}
        >
          Begin Simulation
        </button>
      </div>
    );
  }

  if (isDead) {
    return (
      <div
        className="glass-panel"
        style={{
          textAlign: "center",
          maxWidth: "500px",
          background: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgba(239, 68, 68, 0.3)",
        }}
      >
        <Activity
          size={64}
          color="var(--error)"
          style={{ margin: "0 auto 1.5rem auto" }}
        />
        <h1
          style={{
            marginBottom: "1rem",
            fontSize: "2.5rem",
            color: "var(--error)",
          }}
        >
          Critical Failure
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "2rem",
            fontSize: "1.2rem",
          }}
        >
          You survived for {timeActive.toFixed(1)} seconds and solved {score}{" "}
          problems.
        </p>
        <button
          onClick={restart}
          style={{
            background: "transparent",
            border: "2px solid var(--text-main)",
            color: "var(--text-main)",
            fontSize: "1.2rem",
            fontWeight: 600,
            padding: "1rem 3rem",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={isAfib ? "afib-active" : ""}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        padding: "2rem",
        position: "relative",
        transition: "background-color 2s ease",
        backgroundColor: isAfib ? "rgba(50, 0, 0, 0.4)" : "transparent",
        cursor: isAfib ? "none" : "default", // Fallback
      }}
    >
      <AfibDisturbances isActive={isAfib} />

      {/* Delayed Fake Cursor */}
      {isAfib && (
        <div
          className="delayed-cursor"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        />
      )}

      {/* Evasive Target Nodes during Afib */}
      {isAfib && targetPos && (
        <div
          className="floating-target"
          style={{ left: targetPos.x, top: targetPos.y }}
          onMouseDown={handleTargetClick}
        >
          <Activity size={24} />
        </div>
      )}

      {/* Top HUD */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "800px",
          marginBottom: "2rem",
          zIndex: 10,
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: "1rem 2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <HeartPulse
            color={isAfib ? "var(--error)" : "var(--success)"}
            className={isAfib ? "shake-element" : ""}
          />
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Status
            </div>
            <div
              style={{
                fontWeight: "bold",
                color: isAfib ? "var(--error)" : "var(--success)",
              }}
            >
              {isAfib ? "ATRIAL FIBRILLATION" : "Normal Sinus Rhythm"}
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: "1rem 2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Brain color="var(--accent)" />
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Focus Score
            </div>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              {score}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          zIndex: 10,
          width: "100%",
        }}
      >
        <MathProblem
          isAfib={isAfib}
          onCorrect={() => setScore((s) => s + 10)}
          onTimeout={penaltyScore}
        />

        <BreathingMeter oxygenLevel={oxygen} isAfib={isAfib} />
      </div>
    </div>
  );
}

export default App;
