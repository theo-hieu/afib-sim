type BreathingMeterProps = {
  oxygenLevel: number;
  isAfib: boolean;
};

export function BreathingMeter({ oxygenLevel, isAfib }: BreathingMeterProps) {
  const isDanger = oxygenLevel < 30;

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "2rem auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
          fontFamily: "JetBrains Mono",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>O2 Level</span>
        <span style={{ color: isDanger ? "var(--error)" : "var(--text-main)" }}>
          {Math.round(oxygenLevel)}%
        </span>
      </div>
      <div className={`breathing-track ${isAfib ? "shake-element" : ""}`}>
        <div
          className={`breathing-fill ${isDanger || isAfib ? "danger" : ""}`}
          style={{ width: `${oxygenLevel}%` }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: "1rem",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        Press{" "}
        <strong
          style={{
            color: "white",
            background: "rgba(255,255,255,0.1)",
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
          }}
        >
          SPACE
        </strong>{" "}
        to breathe
      </p>
    </div>
  );
}
