"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditEventPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params?.eventId;

  const [clubId, setClubId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [iceBreakers, setIceBreakers] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/leader/events/${eventId}`, { cache: "no-store" });
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
        setErr(data?.error ?? "Failed to load event.");
        setLoading(false);
        return;
      }

      const e = data?.event ?? {};
      setClubId(String(e.clubId ?? ""));
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
        IceBreakers: iceBreakers,
      }),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }

    if (!res.ok) {
      setErr(data?.error ?? "Failed to update event.");
      setSaving(false);
      return;
    }

    setMsg("Event updated!");
    setSaving(false);
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
          <Link className="btn" href="/leader/dashboard">Dashboard</Link>
          <Link className="btn" href="/directory">Directory</Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onSave}>
        <label className="label">Club</label>
        <input className="input" value={clubId} disabled />

        <div style={{ height: 10 }} />

        <label className="label">Event Title *</label>
        <input className="input" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />

        <div style={{ height: 10 }} />

        <label className="label">Event Date *</label>
        <input className="input" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />

        <div style={{ height: 10 }} />

        <label className="label">Event Time</label>
        <input className="input" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />

        <div style={{ height: 10 }} />

        <label className="label">Location / Zoom Link</label>
        <input
          className="input"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          placeholder="Room 101 or https://zoom.us/..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Description</label>
        <textarea
          className="input"
          rows={4}
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
        />

        <div style={{ height: 10 }} />

        <label className="label">Icebreaker Seeds</label>
        <textarea
          className="input"
          value={iceBreakers}
          onChange={(e) => setIceBreakers(e.target.value)}
          placeholder="What should attendees share or discuss?"
          style={{ minHeight: 120 }}
        />

        {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}
        {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Event"}
          </button>
          <Link className="btn" href="/leader/dashboard">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
