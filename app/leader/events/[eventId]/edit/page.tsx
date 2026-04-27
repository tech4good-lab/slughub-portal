"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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
        setErr("Forbidden: you don't have access to edit this event.");
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

    const res = await fetch(`/api/leader/events/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTitle,
        eventDate,
        eventTime,
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
          JSON.stringify({ ts: Date.now(), events }),
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

  if (loading) {
    return (
      <main className="container clubCreateEvent">
        <div className="card">
          <p className="small">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container clubCreateEvent">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Edit Event</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">
            Dashboard
          </Link>
          <Link className="btn" href="/directory">
            Directory
          </Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onSave}>
        <label className="label">Community</label>
        <input className="input" value={clubName} disabled />

        <div style={{ height: 10 }} />

        <label className="label">Event Title *</label>
        <input
          className="input"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Event Date *</label>
        <input
          className="input"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Event Time</label>
        <input
          className="input"
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
        />

        <div style={{ height: 10 }} />

        <label className="label">Location</label>
        <input
          className="input"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          placeholder="Community Room at John R Lewis..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Zoom Link</label>
        <input
          className="input"
          type="url"
          value={zoomLink}
          onChange={(e) => setZoomLink(e.target.value)}
          placeholder="https://zoom.us/..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Icebreaker Seeds</label>
        <input
          className="input"
          value={iceBreakers}
          onChange={(e) => setIceBreakers(e.target.value)}
          placeholder="What kinds of things would you like to learn about students attending this event?"
        />

        <div style={{ height: 10 }} />

        <label className="label">Description</label>
        <textarea
          className="input"
          rows={4}
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
        />

        {err && (
          <p className="small" style={{ marginTop: 10 }}>
            {err}
          </p>
        )}
        {msg && (
          <p className="small" style={{ marginTop: 10 }}>
            {msg}
          </p>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn btnPrimary"
            type="submit"
            disabled={saving}
            style={{
              padding: "8px 16px",
              background: "#FDF0A6",
              border: "1px solid #FDF0A6",
              borderRadius: 20,
              color: "#000",
              fontFamily: "Sarabun",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "1",
              textDecoration: "none",
              boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
            }}
          >
            {saving ? "Saving..." : "Save Event"}
          </button>
          <Link
            style={{
              padding: "8px 16px",
              background: "#FDF0A6",
              border: "1px solid #FDF0A6",
              borderRadius: 20,
              color: "#000",
              fontFamily: "Sarabun",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "1",
              textDecoration: "none",
              boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
            }}
            className="btn btnPrimary"
            href="/leader/dashboard"
          >
            Cancel
          </Link>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
          Tip: if you include a time, we save it with your date.
        </p>
      </form>
    </main>
  );
}
