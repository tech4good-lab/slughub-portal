import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Navbar from "@/app/components/Navbar";
import styles from "./about.module.css";

export const metadata = {
  title: "About — UCSC Community Portal",
  description:
    "Learn about the UCSC Community Portal, student organizations, and campus connections.",
};

export default async function AboutPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session as any)?.role === "admin";
  const isLeader = (session as any)?.role === "leader";

  return (
    <main className={styles.pageWrapper}>
      {/* Signature Portal Floating Ambient Bubbles */}
      <DecorativeBubbles />

      <div className={styles.contentLayer}>
        {/* Navigation Bar (Portal / About in center, Community Lead Login on right) */}
        <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />

        {/* =========================================================
            1. HERO SECTION (Granola Split Grid with Mockup Canvas)
        ========================================================= */}
        <section className={`${styles.sectionContainer} ${styles.heroSection}`}>
          <div className={styles.heroGrid}>
            {/* Left Hero Column */}
            <div>
              <div className={styles.badgePill}>
                <span className={styles.badgeTag}>About</span>
                <span>UCSC Community Portal &amp; SlugPath</span>
              </div>

              <h1 className={styles.heroTitle}>
                Connecting every Slug to their community.
              </h1>

              <p className={styles.heroSubtitle}>
                The central hub for student organizations, campus events, and
                community discovery across UC Santa Cruz.
              </p>

              <div className={styles.heroButtons}>
                <Link
                  href="/"
                  className={`${styles.pillBtn} ${styles.pillBtnPrimary}`}
                  style={{ padding: "12px 26px", fontSize: "15px" }}
                >
                  Browse Communities
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/login"
                  className={`${styles.pillBtn} ${styles.pillBtnSecondary}`}
                  style={{ padding: "12px 22px", fontSize: "15px" }}
                >
                  Leader Access
                </Link>
              </div>

              <div className={styles.heroMeta}>
                <span className={styles.heroMetaDot} aria-hidden="true" />
                <span>
                  Verified student communities • Free for all UCSC students
                </span>
              </div>
            </div>

            {/* Right Hero Column: Framed Mockup Canvas */}
            <div>
              <div className={styles.mockupCard}>
                <div className={styles.mockupHeader}>
                  <div className={styles.windowDots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <span className={styles.mockupTitle}>Canvas Preview</span>
                </div>

                <div className={styles.mockupBody}>
                  {/* Blank slot container ready for hero image or interactive component */}
                  <div
                    className={styles.placeholderSlot}
                    style={{ minHeight: "180px" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(17,24,39,0.3)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Hero Visual / Mockup Placeholder</span>
                    </div>
                  </div>

                  <div className={styles.placeholderTextLine} style={{ width: "85%" }} />
                  <div className={styles.placeholderTextLine} style={{ width: "95%" }} />
                  <div className={styles.placeholderTextLine} style={{ width: "70%" }} />

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: "auto",
                      paddingTop: 16,
                      borderTop: "1px solid rgba(16,24,40,0.06)",
                    }}
                  >
                    <div
                      className={styles.placeholderSlot}
                      style={{ flex: 1, padding: "10px", fontSize: "12px" }}
                    >
                      Feature Slot A
                    </div>
                    <div
                      className={styles.placeholderSlot}
                      style={{ flex: 1, padding: "10px", fontSize: "12px" }}
                    >
                      Feature Slot B
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. RULED NOTEPAD HIGHLIGHTS (Granola Iconic Notepad Paper)
        ========================================================= */}
        <section className={styles.notepadSection}>
          <div className={styles.ruledBackground} aria-hidden="true" />
          <div className={styles.notepadGrid}>
            <div className={styles.notepadLeft}>
              <h2 className={styles.sectionHeadline}>
                Designed for student life, built for genuine connection.
              </h2>

              <div className={styles.notepadPoints}>
                <div className={styles.notepadPoint}>
                  <div className={styles.pointIconWrap}>🎓</div>
                  <div className={styles.pointContent}>
                    <h4>Campus-wide Discovery</h4>
                    <p>
                      Explore academic, cultural, social, and professional
                      organizations in one unified, searchable directory.
                    </p>
                  </div>
                </div>

                <div className={styles.notepadPoint}>
                  <div className={styles.pointIconWrap}>✨</div>
                  <div className={styles.pointContent}>
                    <h4>AI-Assisted Guidance</h4>
                    <p>
                      Chat with SlugPath to find communities aligned with your
                      major, passions, and personal goals.
                    </p>
                  </div>
                </div>

                <div className={styles.notepadPoint}>
                  <div className={styles.pointIconWrap}>🔒</div>
                  <div className={styles.pointContent}>
                    <h4>Verified Organizations</h4>
                    <p>
                      Official leadership listings and up-to-date links to
                      Discord, Instagram, and regular meeting spots.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.notepadRight}>
              <div
                className={styles.placeholderSlot}
                style={{ minHeight: "360px", background: "#ffffff" }}
              >
                <div style={{ textAlign: "center", maxWidth: "320px" }}>
                  <p style={{ fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                    Notepad Highlight Canvas
                  </p>
                  <p style={{ fontSize: "13px", color: "rgba(17,24,39,0.5)" }}>
                    Placeholder area for interactive preview, architecture
                    diagram, or campus illustration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. BIG DISPLAY TYPOGRAPHIC STATEMENT (Granola "For the doers")
        ========================================================= */}
        <section className={styles.statementSection}>
          <p className={styles.statementTag}>Our Mission</p>
          <h2 className={styles.statementTitle}>For the Slugs.</h2>
          <p className={styles.statementSubtitle}>
            Empowering student leaders, emerging creators, and every newcomer at
            UC Santa Cruz to find their circle and thrive.
          </p>
        </section>

        {/* =========================================================
            4. 3-STEP PROCESS GRID (Granola "Before, During, After")
        ========================================================= */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionHeadline}>How it works</h2>
            <p className={styles.sectionSubtitle}>
              Three simple steps to connect with organizations and events.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>Step 01</span>
              <h3 className={styles.stepTitle}>Explore &amp; Search</h3>
              <p className={styles.stepDesc}>
                Browse clubs by category, interests, or use conversational AI to
                find groups that match your interests.
              </p>
              <div className={`${styles.placeholderSlot} ${styles.stepSlot}`}>
                <span>Step 1 Visual Slot</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>Step 02</span>
              <h3 className={styles.stepTitle}>Connect Directly</h3>
              <p className={styles.stepDesc}>
                Access verified Discord servers, social media channels, and
                meeting schedules with one click.
              </p>
              <div className={`${styles.placeholderSlot} ${styles.stepSlot}`}>
                <span>Step 2 Visual Slot</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>Step 03</span>
              <h3 className={styles.stepTitle}>Lead &amp; Grow</h3>
              <p className={styles.stepDesc}>
                Student leaders manage profiles, publish upcoming events, and
                welcome new members seamlessly.
              </p>
              <div className={`${styles.placeholderSlot} ${styles.stepSlot}`}>
                <span>Step 3 Visual Slot</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. BENTO FEATURE GRID (Granola "Works Everywhere" Bento)
        ========================================================= */}
        <section className={styles.bentoSection}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionHeadline}>Key Capabilities</h2>
            <p className={styles.sectionSubtitle}>
              Everything built with the UCSC student experience in mind.
            </p>
          </div>

          {/* Top Row: 1 Wide Card + 1 Regular Card */}
          <div className={styles.bentoGridTop}>
            <div className={styles.bentoCard}>
              <span className={styles.badgeTag} style={{ width: "fit-content" }}>
                Feature Spotlight
              </span>
              <h3 className={styles.bentoTitle}>AI-Powered Recommendations</h3>
              <p className={styles.bentoDesc}>
                SlugPath understands questions like &quot;What clubs are good for
                transfer students in CS?&quot; and points you to the right
                communities.
              </p>
              <div
                className={styles.placeholderSlot}
                style={{ height: "180px", marginTop: "12px" }}
              >
                <span>Spotlight Feature Mockup Slot</span>
              </div>
            </div>

            <div className={styles.bentoCard}>
              <span className={styles.badgeTag} style={{ width: "fit-content" }}>
                Directory
              </span>
              <h3 className={styles.bentoTitle}>Filter by Interests</h3>
              <p className={styles.bentoDesc}>
                Instantly filter by Academic, Cultural, Tech, Arts, Sports, and
                more.
              </p>
              <div
                className={styles.placeholderSlot}
                style={{ height: "180px", marginTop: "12px" }}
              >
                <span>Filter UI Mockup Slot</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Equal Bento Cards */}
          <div className={styles.bentoGridBottom}>
            <div className={styles.bentoCard}>
              <h3 className={styles.bentoTitle}>Campus Events</h3>
              <p className={styles.bentoDesc}>
                Discover general body meetings, workshops, and hackathons
                happening this week.
              </p>
              <div className={styles.placeholderSlot} style={{ height: "130px" }}>
                <span>Event Calendar Slot</span>
              </div>
            </div>

            <div className={styles.bentoCard}>
              <h3 className={styles.bentoTitle}>Leader Dashboard</h3>
              <p className={styles.bentoDesc}>
                Officers can update descriptions, meeting locations, and social
                links in real-time.
              </p>
              <div className={styles.placeholderSlot} style={{ height: "130px" }}>
                <span>Dashboard UI Slot</span>
              </div>
            </div>

            <div className={styles.bentoCard}>
              <h3 className={styles.bentoTitle}>Mobile Friendly</h3>
              <p className={styles.bentoDesc}>
                Fully responsive layout designed for quick access on your phone
                between classes.
              </p>
              <div className={styles.placeholderSlot} style={{ height: "130px" }}>
                <span>Mobile Preview Slot</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. WARM TINTED ACCENT BANNER (Granola "Memory" Banner)
        ========================================================= */}
        <section className={styles.accentBannerSection}>
          <div className={styles.accentBanner}>
            <div>
              <h2 className={styles.accentBannerTitle}>
                A single home for all student organizations.
              </h2>
              <p className={styles.accentBannerText}>
                No more digging through outdated spreadsheets or disconnected
                chat groups. Everything in one place, updated by the community.
              </p>
              <Link
                href="/"
                className={`${styles.pillBtn} ${styles.pillBtnSecondary}`}
                style={{ fontWeight: 700 }}
              >
                Explore the Portal Directory →
              </Link>
            </div>

            <div>
              <div
                className={styles.placeholderSlot}
                style={{
                  minHeight: "180px",
                  background: "rgba(255, 255, 255, 0.6)",
                  borderColor: "rgba(251, 191, 36, 0.4)",
                  color: "rgba(17, 24, 39, 0.7)",
                }}
              >
                <span>Accent Banner Visual Slot</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            7. STATS & COMMUNITY METRICS GRID
        ========================================================= */}
        <section className={styles.statsSection}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionHeadline}>Community at a Glance</h2>
            <p className={styles.sectionSubtitle}>
              Connecting students across all ten residential colleges.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>150+</div>
              <div className={styles.statLabel}>Active Organizations</div>
              <p className={styles.statSub}>
                From engineering teams to cultural coalitions and dance troupes.
              </p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>10</div>
              <div className={styles.statLabel}>Colleges Represented</div>
              <p className={styles.statSub}>
                Bridging campus communities across Cowell, Stevenson, Crown, and beyond.
              </p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Free &amp; Open</div>
              <p className={styles.statSub}>
                Built by and for UC Santa Cruz students, open to all campus members.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            8. FINAL CALL TO ACTION (Granola "Unlimited Free" Banner)
        ========================================================= */}
        <section className={styles.finalCtaSection}>
          <div className={styles.finalCtaCard}>
            <span className={styles.badgeTag}>Get Started</span>
            <h2 className={styles.ctaTitle}>Ready to find your community?</h2>
            <p className={styles.ctaSubtitle}>
              Explore student clubs, meet leaders, and discover upcoming campus
              events on the UCSC Community Portal today.
            </p>

            <div className={styles.ctaButtons}>
              <Link
                href="/"
                className={`${styles.pillBtn} ${styles.pillBtnPrimary}`}
                style={{ padding: "12px 28px", fontSize: "15px" }}
              >
                Open Community Directory
              </Link>
              <Link
                href="/login"
                className={`${styles.pillBtn} ${styles.pillBtnSecondary}`}
                style={{ padding: "12px 24px", fontSize: "15px" }}
              >
                Officer Login
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            9. MULTI-COLUMN FOOTER (Granola Directory Footer)
        ========================================================= */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerGrid}>
              {/* Brand Column */}
              <div className={styles.footerBrandCol}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Image
                    src="/dashboard-icon.png"
                    alt="Logo"
                    width={28}
                    height={28}
                  />
                  <span className={styles.footerBrandTitle}>SlugPath</span>
                </div>
                <p className={styles.footerBrandDesc}>
                  The official community directory and discovery engine for UC
                  Santa Cruz students and organizations.
                </p>
              </div>

              {/* Column 1 */}
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Navigation</span>
                <Link href="/" className={styles.footerLink}>
                  Portal
                </Link>
                <Link href="/about" className={styles.footerLink}>
                  About
                </Link>
                <Link href="/login" className={styles.footerLink}>
                  Community Lead Login
                </Link>
                <Link href="/signup" className={styles.footerLink}>
                  Sign Up
                </Link>
              </div>

              {/* Column 2 */}
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Resources</span>
                <Link
                  href="https://chat.slughub.cc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  SlugPath AI
                </Link>
                <Link href="/" className={styles.footerLink}>
                  Campus Events
                </Link>
                <Link href="/" className={styles.footerLink}>
                  Club Categories
                </Link>
              </div>

              {/* Column 3 */}
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Campus</span>
                <a
                  href="https://www.ucsc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  UC Santa Cruz
                </a>
                <a
                  href="https://soar.ucsc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  SOAR / Student Life
                </a>
                <a
                  href="https://tech4good.soe.ucsc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  Tech4Good Lab
                </a>
              </div>

              {/* Column 4 */}
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>About Slots</span>
                <span className={styles.footerLink}>Placeholder Link 1</span>
                <span className={styles.footerLink}>Placeholder Link 2</span>
                <span className={styles.footerLink}>Placeholder Link 3</span>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <span>
                &copy; {new Date().getFullYear()} UCSC Community Portal • SlugPath
              </span>
              <span>Built with ❤️ for UC Santa Cruz</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
