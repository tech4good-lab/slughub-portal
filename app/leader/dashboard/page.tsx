import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { CSSProperties } from "react";
import EventsCacheClient from "@/app/components/EventsCacheClient";
import ClubsCacheClient from "@/app/components/ClubsCacheClient";
import LogoutButton from "@/app/leader/edit/logout-button";
import DeleteClubButton from "./delete-club-button";
import PendingBadge from "@/app/components/PendingBadge";
import ClubsSearchList from "./clubs-list";

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
        background: "rgb(237, 244, 255)",
        overflowX: "hidden",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(12px, 3vw, 20px)",
      }}
    >
      <ClubsCacheClient clubs={clubs as any[]} />
      <EventsCacheClient events={Object.values(eventsByClub).flat() as any[]} />

      {/* Decorative bubbles */}
      <div
        style={{
          position: "absolute",
          width: 60,
          height: 60,
          left: "10%",
          top: "5%",
          opacity: 0.4,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 30,
          height: 30,
          left: "65%",
          top: "3%",
          opacity: 0.5,
          background: "#FDF0A6",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          left: "75%",
          top: "12%",
          opacity: 0.3,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          left: "80%",
          top: "55%",
          opacity: 0.4,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 35,
          height: 35,
          left: "85%",
          top: "75%",
          opacity: 0.5,
          background: "#FDF0A6",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 25,
          height: 25,
          left: "15%",
          top: "80%",
          opacity: 0.4,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />

      {/* Main card container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "clamp(16px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "black",
                  fontSize: "clamp(24px, 5vw, 32px)",
                }}
              >
                Dashboard
              </h1>
            </div>

            {/* Nav requires scrolling on mobile/smaller devices */}
            <nav
              className="row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "nowrap",
                overflowX: "auto",
                overflowY: "visible",
                paddingBottom: "4px",
                paddingTop: "9px",
              }}
            >
              {isAdmin && (
                <>
                  <Link
                    className="btn"
                    href="/admin/review"
                    style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Community Approvals
                  </Link>
                  <Link
                    className="btn"
                    href="/admin/access"
                    style={{ whiteSpace: "nowrap", flexShrink: 0}}
                  >
                    Access Requests
                  </Link>
                </>
              )}
              <Link
                className="btn"
                href="/directory"
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                Directory
              </Link>
              <div style={{ flexShrink: 0, alignSelf: "center" }}>
                <LogoutButton />
              </div>
            </nav>
          </header>

          {/* Logged in info and divider */}
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                color: "black",
                fontSize: 14,
                fontFamily: "Sarabun",
                margin: "0 0 12px 0",
              }}
            >
              Logged in as: {session?.user?.email} | {role ?? "<role>"}
            </p>
            <div style={{ width: "100%", height: 0.5, background: "#333333" }} />
          </div>

          {/* Section header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 30,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              width: "100%",
            }}>
                <h2
                style={{
                  fontSize: 24,
                  fontFamily: "Sarabun",
                  fontWeight: 700,
                  margin: 0,
                  color: "black",
                }}
              >
                My Communities
              </h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
              </div>
            </div>
          </div>

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

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 14,
          fontFamily: "Sarabun",
          color: "#333",
          marginTop: 20,
          position: "relative",
          zIndex: 10,
          WebkitTextStroke: "0.4px black",
        }}
      >
        A{" "}
        <a
          href="https://tech4good.soe.ucsc.edu/"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#FDF0A6",
            textDecoration: "none",
            fontWeight: "1000",
            WebkitTextStroke: "0.3px black",
          }}
        >
          Tech4Good
        </a>{" "}
        project
      </div>
    </div>
  );
}