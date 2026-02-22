import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Substrata — Explore the hidden layers of the world";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#0B1117",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Strata strip — left column */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 300,
            height: 630,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, background: "#3A9096" }} />
          <div style={{ flex: 1, background: "#1F5A5C" }} />
          <div style={{ flex: 1, background: "#8C7448" }} />
          <div style={{ flex: 1, background: "#5C4030" }} />
          <div style={{ flex: 1, background: "#252E38" }} />
        </div>

        {/* Fade overlay on strip right edge */}
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 0,
            width: 160,
            height: 630,
            background: "linear-gradient(to right, transparent, #0B1117)",
          }}
        />

        {/* Content area */}
        <div
          style={{
            position: "absolute",
            left: 360,
            top: 0,
            right: 0,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              width: 4,
              height: 90,
              background: "#3A9096",
              borderRadius: 2,
              marginBottom: 24,
            }}
          />

          {/* Wordmark */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#F0F0EE",
              letterSpacing: "-1px",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Substrata
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 22,
              color: "#6B7280",
              letterSpacing: "1px",
              marginBottom: 32,
            }}
          >
            Explore the hidden layers of the world
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 12 }}>
            {["Deep Time", "Paleogeography", "History Layers"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(44,111,116,0.25)",
                  border: "1px solid rgba(44,111,116,0.5)",
                  borderRadius: 13,
                  padding: "6px 16px",
                  fontSize: 13,
                  color: "#89CDD1",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
