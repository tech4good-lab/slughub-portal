"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ClubOption = {
  clubId: string;
  name?: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<ClubOption[]>([]);
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
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const raw = localStorage.getItem("leaderClubsCache_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          const list = (parsed?.clubs ?? []) as ClubOption[];
          if (Array.isArray(list) && list.length > 0) {
            setClubs(list);
            setClubId(String(list[0].clubId ?? ""));
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore cache errors
      }

      const res = await fetch("/api/leader/clubs");

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        setErr("Forbidden: you don't have access to create events.");
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
        setErr(data?.error ?? "Failed to load clubs.");
        setLoading(false);
        return;
      }

      const list = (data?.clubs ?? []) as ClubOption[];
      setClubs(list);
      if (list.length > 0) setClubId(String(list[0].clubId ?? ""));
      try {
        localStorage.setItem(
          "leaderClubsCache_v1",
          JSON.stringify({ ts: Date.now(), clubs: list })
        );
      } catch {
        // ignore cache errors
      }
      setLoading(false);
    })();
  }, [router]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSaving(true);

    const res = await fetch("/api/leader/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId,
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
      setErr(data?.error ?? "Failed to create event.");
      setSaving(false);
      return;
    }

    setMsg("Event created!");
    setSaving(false);
    setTimeout(() => router.push("/leader/dashboard"), 600);
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
        <h1>Create Event</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">Dashboard</Link>
          <Link className="btn" href="/directory">Directory</Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onCreate}>
        <label className="label">Club *</label>
        <select
          className="input"
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          required
        >
          {clubs.length === 0 ? (
            <option value="">No club access</option>
          ) : (
            clubs.map((club) => (
              <option key={club.clubId} value={club.clubId}>
                {club.name ?? club.clubId}
              </option>
            ))
          )}
        </select>

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
          <button className="btn btnPrimary" type="submit" disabled={saving || clubs.length === 0}>
            {saving ? "Creating..." : "Create Event"}
          </button>
          <Link className="btn" href="/leader/dashboard">Cancel</Link>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
          Tip: if you include a time, we save it with your date.
        </p>
      </form>
    </main>
  );
}
