"use client";
import { useState } from "react";

export default function CalendarEmbed({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        onClick={() => setExpanded(true)}
        style={{
          position: "relative",
          width: "100%",
          height: 350,
          marginTop: 8,
          cursor: "pointer",
        }}
      >
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 8,
              background: "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
              backgroundSize: "400% 100%",
              animation: "skeleton-shimmer 1.4s ease infinite",
            }}
          />
        )}
        <iframe
          src={src}
          onLoad={() => setLoaded(true)}
          style={{
            display: "flex",
            border: 0,
            width: "100%",
            height: "100%",
            borderRadius: 8,
            pointerEvents: "none", // let clicks pass through to the wrapping div
          }}
        />
      </div>

      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 1100,
              height: "85vh",
              background: "#fff",
              borderRadius: 12,
            }}
          >
            <iframe
              src={src}
              style={{ border: 0, width: "100%", height: "100%", borderRadius: 12 }}
            />
          </div>
        </div>
      )}
    </>
  );
}