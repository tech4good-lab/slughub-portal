"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Footer from "@/app/components/Footer";

export default function EditEventPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params?.eventId;

  const [clubName, setClubName] = useState("");
  const [clubId, setClubId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [iceBreakers, setIceBreakers] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setSession(s);
    })();
  }, []);

  useEffect(() => {
    if (!eventId || eventId === "undefined") {
      setErr("No valid event ID provided.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const raw = localStorage.getItem("clubEventsCache_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          const cached = (parsed?.events ?? []).find(
            (ev: any) => String(ev?.recordId ?? "") === String(eventId),
          );
          if (cached) {
            setClubId(String(cached.clubId ?? ""));
            setClubName(String(cached.clubName ?? "Unknown Community"));
            setEventTitle(String(cached.eventTitle ?? cached.name ?? ""));
            const rawDate = String(cached.eventDate ?? "");
            if (rawDate.includes("T")) {
              setEventDate(rawDate.slice(0, 10));
              setEventTime(rawDate.slice(11, 16));
            } else {
              setEventDate(rawDate);
            }
            setEventLocation(String(cached.eventLocation ?? ""));
            setEventDescription(String(cached.eventDescription ?? ""));
            setZoomLink(String(cached.zoomLink ?? ""));
            setIceBreakers(String(cached.iceBreakers ?? ""));
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore cache errors
      }

      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/leader/events/${eventId}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        setErr("Forbidden: you do not have access to edit this event.");
        setLoading(false);
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        if (res.status === 404) {
          setErr(
            "This event no longer exists. Clearing it from your dashboard...",
          );
          try {
            const raw = localStorage.getItem("clubEventsCache_v1");
            if (raw) {
              const parsed = JSON.parse(raw);
              const events = Array.isArray(parsed?.events) ? parsed.events : [];
              const filteredEvents = events.filter(
                (ev: any) => String(ev?.recordId ?? "") !== String(eventId),
              );
              localStorage.setItem(
                "clubEventsCache_v1",
                JSON.stringify({ ts: Date.now(), events: filteredEvents }),
              );
            }
          } catch {
            // ignore cache errors
          }

          setTimeout(() => {
            router.push("/leader/dashboard");
            router.refresh();
          }, 2000);
          return;
        }

        setErr(data?.error ?? "Failed to load event.");
        setLoading(false);
        return;
      }

      const e = data?.event ?? {};
      setClubId(String(e.clubId ?? ""));
      setClubName(String(e.clubName ?? "Unknown Community"));
      setEventTitle(String(e.eventTitle ?? e.name ?? ""));
      const rawDate = String(e.eventDate ?? "");
      if (rawDate.includes("T")) {
        setEventDate(rawDate.slice(0, 10));
        setEventTime(rawDate.slice(11, 16));
      } else {
        setEventDate(rawDate);
      }
      setEventLocation(String(e.eventLocation ?? ""));
      setEventDescription(String(e.eventDescription ?? ""));
      setIceBreakers(String(e.iceBreakers ?? ""));
      setZoomLink(String(e.zoomLink ?? ""));
      setLoading(false);
    })();
  }, [eventId, router]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    setErr(null);
    setMsg(null);
    setSaving(true);

    const fullDate = eventDate
      ? `${eventDate}${eventTime ? `T${eventTime}` : ""}`
      : "";

    const res = await fetch(`/api/leader/events/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTitle,
        eventDate: fullDate,
        eventLocation,
        eventDescription,
        iceBreakers,
        zoomLink,
      }),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }

    if (!res.ok) {
      setSaving(false);
      if (res.status === 404) {
        setErr(
          "This event no longer exists on the server. Removing from dashboard...",
        );
        try {
          const raw = localStorage.getItem("clubEventsCache_v1");
          if (raw) {
            const parsed = JSON.parse(raw);
            const events = Array.isArray(parsed?.events) ? parsed.events : [];
            const filteredEvents = events.filter(
              (ev: any) => String(ev?.recordId ?? "") !== String(eventId),
            );
            localStorage.setItem(
              "clubEventsCache_v1",
              JSON.stringify({ ts: Date.now(), events: filteredEvents }),
            );
          }
        } catch {
          // ignore cache errors
        }

        setTimeout(() => {
          router.push("/leader/dashboard");
          router.refresh();
        }, 2000);

        return;
      }

      setErr(data?.error ?? "Failed to update event.");
      return;
    }

    setMsg("Event updated!");
    setSaving(false);
    try {
      const raw = localStorage.getItem("clubEventsCache_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        const events = Array.isArray(parsed?.events) ? parsed.events : [];
        const idx = events.findIndex(
          (ev: any) => String(ev?.recordId ?? "") === String(eventId),
        );
        const updated = {
          ...events[idx],
          recordId: eventId,
          clubId,
          eventTitle,
          name: eventTitle,
          eventDate: eventDate
            ? `${eventDate}${eventTime ? `T${eventTime}` : ""}`
            : "",
          eventLocation,
          eventDescription,
          iceBreakers,
          zoomLink,
        };
        if (idx >= 0) {
          events[idx] = updated;
        } else {
          events.push(updated);
        }
        localStorage.setItem(
          "clubEventsCache_v1",
          JSON.stringify({ ts: Date.now(), events: events }),
        );
      }
    } catch {
      // ignore cache errors
    }
    setTimeout(() => {
      router.push("/leader/dashboard");
      router.refresh();
    }, 600);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(16,24,40,0.18)",
    fontSize: 14,
    fontFamily: "Sarabun",
    boxSizing: "border-box",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    fontFamily: "Sarabun",
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#EDF4FF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "clamp(12px, 3vw, 20px)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <DecorativeBubbles />
        <Navbar session={session} />
        <div style={{ margin: "auto", zIndex: 10, textAlign: "center", color: "#4b5563" }}>
          Loading event details...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#EDF4FF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(12px, 3vw, 20px)",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <DecorativeBubbles />
      <Navbar session={session} />

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          margin: "30px 0 40px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 680,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "clamp(16px, 4vw, 40px)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: "1px solid rgba(16,24,40,0.08)",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <img
                src="/dashboard-icon.png"
                alt="Dashboard Icon"
                style={{ width: 44, height: 44 }}
              />
              <div>
                <h1
                  style={{
                    color: "black",
                    fontSize: "24px",
                    fontFamily: "Sarabun",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  Edit Event
                </h1>
                <p
                  style={{
                    color: "#666",
                    fontSize: 14,
                    fontFamily: "Sarabun",
                    fontWeight: "400",
                    margin: "4px 0 0 0",
                  }}
                >
                  Update your event time, location, and info.
                </p>
              </div>
            </div>

            <Link
              href="/leader/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 34,
                padding: "0 16px",
                background: "#f3f4f6",
                borderRadius: 20,
                color: "#374151",
                fontSize: 13,
                fontFamily: "Sarabun",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Back to Dashboard
            </Link>
          </div>

          <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Community</label>
              <input
                style={{ ...inputStyle, background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
                value={clubName}
                disabled
              />
            </div>

            <div>
              <label style={labelStyle}>Event Title *</label>
              <input
                style={inputStyle}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Event Date *</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Event Time</label>
                <input
                  type="time"
                  style={inputStyle}
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input
                style={inputStyle}
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Community Room at John R Lewis..."
              />
            </div>

            <div>
              <label style={labelStyle}>Zoom Link (Optional)</label>
              <input
                type="url"
                style={inputStyle}
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/..."
              />
            </div>

            <div>
              <label style={labelStyle}>Icebreaker Seeds (Optional)</label>
              <input
                style={inputStyle}
                value={iceBreakers}
                onChange={(e) => setIceBreakers(e.target.value)}
                placeholder="What kinds of things would you like to learn about students attending this event?"
              />
            </div>

            <div>
              <label style={labelStyle}>Description (Optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                rows={4}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Tell students what to expect..."
              />
            </div>

            {err && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  color: "#b91c1c",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                }}
              >
                {err}
              </div>
            )}

            {msg && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 10,
                  color: "#166534",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                }}
              >
                {msg}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  padding: "0 24px",
                  background: "#FDF0A6",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  borderRadius: 20,
                  color: "#000",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: "600",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Event"}
              </button>

              <Link
                href="/leader/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  padding: "0 20px",
                  background: "#f3f4f6",
                  borderRadius: 20,
                  color: "#374151",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
