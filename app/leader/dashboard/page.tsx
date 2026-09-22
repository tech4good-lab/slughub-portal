import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { CSSProperties } from "react";
import EventsCacheClient from "@/app/components/EventsCacheClient";
import ClubsCacheClient from "@/app/components/ClubsCacheClient";
import DeleteClubButton from "./delete-club-button";
import ClubsSearchList from "./clubs-list";
import Navbar from "@/app/components/Navbar";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Footer from "@/app/components/Footer";

export const dynamic = "force-dynamic";



export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;
  const now = new Date();
  const oneMonthOut = new Date();
  oneMonthOut.setMonth(now.getMonth() + 1);
  

  if (!userId) redirect("/login");

  const isAdmin = role === "admin";

  let clubs: any[] = [];
  let eventsByClub: Record<string, any[]> = {};

  try {
    if (isAdmin) {
      const allClubs = await prisma.club.findMany({
        include: {
          events: { orderBy: { eventDate: "desc" } },
        },
        orderBy: { updatedAt: "desc" },
      });
      for (const club of allClubs) {
        clubs.push(club);
        eventsByClub[club.id] = club.events.map((event: any) => ({ ...event }));
      }
    } else {
      const userMemberships = await prisma.clubMember.findMany({
        where: { userId: userId },
        include: {
          club: {
            include: {
              events: {
                orderBy: { eventDate: "desc" },
              },
            },
          },
        },
      });

      for (const membership of userMemberships) {
        if (membership.club) {
          const club = membership.club;

          clubs.push(club);

          eventsByClub[club.id] = club.events.map((event: any) => ({
            ...event,
          }));
        }
      }
    }

    clubs.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  } catch (error) {
    console.error("Prisma Error loading Leader Dashboard:", error);
  }

  return (
    <div
      className="leaderDashboard"
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
      <ClubsCacheClient clubs={clubs as any[]} />
      <EventsCacheClient events={Object.values(eventsByClub).flat() as any[]} />

      {/* Signature Floating Ambient Bubbles */}
      <DecorativeBubbles />

      {/* Floating Pill Navigation Bar */}
      <Navbar session={session} isAdmin={isAdmin} isLeader={!isAdmin} />

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
            maxWidth: 900,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "clamp(20px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  margin: "0 0 6px 0",
                  color: "black",
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontFamily: "Sarabun, sans-serif",
                  fontWeight: 700,
                }}
              >
                My Communities
              </h1>

              <p
                style={{
                  color: "#4b5563",
                  fontSize: 14,
                  fontFamily: "Sarabun, sans-serif",
                  margin: 0,
                }}
              >
                Logged in as: <strong style={{ color: "#111827" }}>{session?.user?.email}</strong>
                {role ? ` (${role})` : ""}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href="/leader/clubs/new"
                style={{
                  padding: "8px 20px",
                  background: "#FDF0A6",
                  border: "none",
                  borderRadius: 20,
                  color: "black",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Create New Community
              </Link>

              {(isAdmin || clubs.length > 0) && (
                <Link
                  href="/leader/events/new"
                  style={{
                    padding: "8px 20px",
                    background: "#E5E7EB",
                    border: "none",
                    borderRadius: 20,
                    color: "black",
                    fontSize: 14,
                    fontFamily: "Sarabun",
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Create Event
                </Link>
              )}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              background: "rgba(16, 24, 40, 0.08)",
              marginBottom: 24,
            }}
          />

          {/* Clubs list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
              overflow: "auto",
            }}
          >
            <ClubsSearchList clubs={clubs} eventsByClub={eventsByClub} now={now} oneMonthOut={oneMonthOut}/>
          </div>
        </div>
      </div>

      <Footer style={{ marginTop: 24 }} />
    </div>
  );
}