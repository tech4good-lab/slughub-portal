"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";

type ClubOption = {
  id: string;
  name?: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [clubId, setClubId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [zoomLink, setZoomLink] = useState("");
  const [iceBreakers, setIceBreakers] = useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const s = await getSession();
      setSession(s);

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
        setErr(data?.error ?? "Failed to load communities.");
        setLoading(false);
        return;
      }

      const list = (data?.clubs ?? []) as ClubOption[];
      setClubs(list);

      if (list.length > 0) setClubId(String(list[0].id ?? ""));

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
        zoomLink,
        iceBreakers,
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

  const userRole = (session as any)?.role || (session as any)?.user?.role;
  const isAdmin = userRole === "admin";
  const isLeader = Boolean(session) && !isAdmin;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#edf4ff",
          position: "relative",
          zIndex: 1,
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DecorativeBubbles />
        <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 800,
              background: "white",
              borderRadius: 25,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              padding: "40px",
              textAlign: "center",
              color: "#6b7280",
              fontFamily: "Sarabun, sans-serif",
            }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#edf4ff",
        position: "relative",
        zIndex: 1,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Signature Floating Ambient Bubbles */}
      <DecorativeBubbles />

      {/* Floating Pill Navigation Bar */}
      <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />

      {/* Main card container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
          padding: "clamp(16px, 3vw, 28px) clamp(12px, 3vw, 20px) 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 800,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "clamp(20px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 18 }}>
            <h1
              style={{
                margin: "0 0 6px 0",
                color: "black",
                fontSize: "clamp(24px, 5vw, 32px)",
                fontFamily: "Sarabun, sans-serif",
                fontWeight: 700,
              }}
            >
              Create Event
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                fontFamily: "Sarabun, sans-serif",
                margin: 0,
              }}
            >
              Add an upcoming event or activity for your community.
            </p>
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              background: "rgba(16, 24, 40, 0.08)",
              marginBottom: 24,
            }}
          />

          <form onSubmit={onCreate}>
            <label className="label">Community *</label>
            <select
              className="input"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
            >
              {clubs.length === 0 ? (
                <option value="">No community access</option>
              ) : (
                clubs.map((club: any) => (
                  <option key={club.id} value={club.id}>
                    {club.name ?? club.id}
                  </option>
                ))
              )}
            </select>

            <div style={{ height: 16 }} />

            <label className="label">Event Title *</label>
            <input
              className="input"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />

            <div style={{ height: 16 }} />

            <label className="label">Event Date *</label>
            <input
              ref={dateInputRef}
              className="input"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              onClick={() => dateInputRef.current?.showPicker?.()}
              required
            />

            <div style={{ height: 16 }} />

            <label className="label">Event Time</label>
            <input
              ref={timeInputRef}
              className="input"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              onClick={() => timeInputRef.current?.showPicker?.()}
            />

            <div style={{ height: 16 }} />

            <label className="label">Location</label>
            <input
              className="input"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Community Room at John R Lewis..."
            />

            <div style={{ height: 16 }} />

            <label className="label">Zoom Link</label>
            <input
              className="input"
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/..."
            />

            <div style={{ height: 16 }} />

            <label className="label">Icebreaker Seeds</label>
            <input
              className="input"
              value={iceBreakers}
              onChange={(e) => setIceBreakers(e.target.value)}
              placeholder="What kinds of things would you like to learn about students attending this event?"
            />

            <div style={{ height: 16 }} />

            <label className="label">Description</label>
            <textarea
              className="input"
              rows={4}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />

            {err && (
              <p className="small" style={{ marginTop: 12, color: "#dc2626" }}>
                {err}
              </p>
            )}
            {msg && (
              <p className="small" style={{ marginTop: 12, color: "#16a34a" }}>
                {msg}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginTop: 26,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={saving || clubs.length === 0}
                style={{
                  padding: "9px 24px",
                  background: "#FDF0A6",
                  border: "1px solid #FDF0A6",
                  borderRadius: 20,
                  color: "#000",
                  fontFamily: "Sarabun",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving || clubs.length === 0 ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(251,191,36,0.14)",
                  transition: "all 0.2s ease",
                }}
              >
                {saving ? "Creating..." : "Create Event"}
              </button>
              <Link
                href="/leader/dashboard"
                style={{
                  padding: "9px 24px",
                  background: "#E5E7EB",
                  border: "none",
                  borderRadius: 20,
                  color: "#000",
                  fontFamily: "Sarabun",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </Link>
            </div>

            <p
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "#6b7280",
                fontFamily: "Sarabun, sans-serif",
              }}
            >
              Tip: if you include a time, we save it with your date.
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: 500,
          color: "#4b5563",
          marginTop: "auto",
          padding: "16px 0 28px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          flexWrap: "wrap",
        }}
      >
        <span>A</span>
        <a
          href="https://tech4good.soe.ucsc.edu/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#1e1e1e",
            textDecoration: "none",
            fontFamily: "'Nunito Sans', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-0.04em",
          }}
        >
          <Image
            src="/tech4good-smile-small.png"
            alt="Tech4Good Smile"
            width={22}
            height={22}
          />
          <span>TECH4GOOD LAB</span>
        </a>
        <span>project</span>
      </div>
    </div>
  );
}
