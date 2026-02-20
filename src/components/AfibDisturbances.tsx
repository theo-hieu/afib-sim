type AfibDisturbancesProps = {
  isActive: boolean;
};

export function AfibDisturbances({ isActive }: AfibDisturbancesProps) {
  if (!isActive) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        // The vignette is now intensely pulsing to mimic severe claustrophobia
        animation:
          "severe-pulse-vignette 0.8s ease-in-out infinite, blurred-vision 2s ease-in-out infinite",
      }}
    />
  );
}
