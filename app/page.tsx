import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DirectoryClient from "@/app/components/DirectoryClient";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import ChatBubble from "@/app/components/ChatBubble";
import Navbar from "@/app/components/Navbar";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session as any)?.role === "admin";
  const isLeader = (session as any)?.role === "leader";

  let clubs = [];

  try {
    clubs = await prisma.club.findMany({
      where: {
        status: "approved",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch (error) {
    console.error("Prisma Error loading directory:", error);
    return (
      <main style={{ minHeight: "100vh", position: "relative", zIndex: 1, backgroundColor: "#edf4ff" }}>
        <DecorativeBubbles />
        <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />
        <div className="container" style={{ paddingTop: 0 }}>
          <div style={{ marginTop: 44, marginBottom: 28 }}>
            <h1
              style={{
                margin: 0,
                color: "black",
                fontSize: "clamp(28px, 5vw, 40px)",
              }}
            >
              UCSC Community Portal
            </h1>
          </div>
          <div className="card">
            <p className="small">
              Failed to load communities. Please try again later.
            </p>
          </div>
          <ChatBubble />
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1, backgroundColor: "#edf4ff" }}>
      <DecorativeBubbles />
      <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />

      <div className="container directoryHome" style={{ paddingTop: 0 }}>
        <div style={{ marginTop: 44, marginBottom: 28 }}>
          <h1
            style={{
              margin: 0,
              color: "black",
              fontSize: "clamp(28px, 5vw, 40px)",
            }}
          >
            UCSC Community Portal
          </h1>
        </div>

        <DirectoryClient clubs={clubs} session={session} />
        <ChatBubble />
      </div>
    </main>
  );
}


