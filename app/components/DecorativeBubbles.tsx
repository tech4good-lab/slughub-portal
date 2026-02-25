export default function DecorativeBubbles() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      <div style={{ position: "absolute", width: 41, height: 41, left: "5%", top: "15%", opacity: 0.5, background: "#D0E2FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 100, height: 100, left: "75%", top: "10%", opacity: 0.4, background: "#D0E2FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 60, height: 60, left: "10%", top: "70%", opacity: 0.4, background: "#D0E2FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 39, height: 39, left: "80%", top: "75%", opacity: 0.5, background: "#FDF0A6", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 22, height: 22, left: "12%", top: "50%", opacity: 0.4, background: "#D0E2FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 75, height: 75, left: "85%", top: "45%", opacity: 0.3, background: "#D0E2FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 17, height: 17, left: "15%", top: "85%", opacity: 0.5, background: "#D0E2FF", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 26, height: 26, left: "82%", top: "65%", opacity: 0.4, background: "#FDF0A6", borderRadius: "50%" }} />
    </div>
  );
}
