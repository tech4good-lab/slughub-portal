import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Navbar from "@/app/components/Navbar";
import ChatBubble from "@/app/components/ChatBubble";
import styles from "./about.module.css";

export const metadata = {
  title: "About — UCSC Community Portal",
  description:
    "Learn about the UCSC Community Portal, student organizations, and campus connections.",
};

export default async function AboutPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "admin";
  const isLeader = userRole === "leader";

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
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle}>
                Connecting every Slug to their community.
              </h1>

              <p className={styles.heroSubtitle}>
                The central hub for student organizations, campus events, and
                community discovery across UC Santa Cruz.
              </p>

              <div className={styles.heroButtons}>
                <Link
                  href="https://chat.slughub.cc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.pillBtn} ${styles.pillBtnPrimary}`}
                  style={{ padding: "12px 24px", fontSize: "15px" }}
                >
                  <span>Chat with SlugPath</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/"
                  className={`${styles.pillBtn} ${styles.pillBtnSecondary}`}
                  style={{ padding: "12px 20px", fontSize: "15px" }}
                >
                  Browse Club Directory
                </Link>
              </div>

              <div style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Participating in the Tech4Good research study?
                </span>
                <Link
                  href="#"
                  style={{
                    fontSize: "12px",
                    color: "#0284c7",
                    fontWeight: 700,
                    textDecoration: "none",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>Consent Form</span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Hero Column: Framed Mockup Canvas */}
            <div className={styles.heroRight}>
              <Link
                href="/"
                className={styles.mockupCardLink}
                aria-label="Explore UCSC Club Directory"
              >
                <div className={styles.mockupCard}>
                  <div className={styles.mockupImageContainer}>
                    <Image
                      src="/white_landing_page.png"
                      alt="UCSC Club Directory Landing Page"
                      width={2856}
                      height={1656}
                      priority
                      className={styles.mockupImage}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. MISSION SECTION
        ========================================================= */}
        <section className={styles.missionSection}>
          <div className={styles.missionCard}>
            <div className={styles.missionHeader}>
              <span className={styles.badgeTag}>Our Mission</span>
            </div>
            <h2 className={styles.missionTitle}>
              Starting college shouldn&apos;t mean figuring it all out alone.
            </h2>
            <p className={styles.missionText}>
              Starting college means figuring out a lot at once: keeping up with classes, learning how campus systems work, and finding where you belong. For many students, exploring their interests and finding communities outside the classroom gets pushed to the back burner &mdash; not because it doesn&apos;t matter, but because there&apos;s no clear entry point and no one helping to guide the search. Without someone to help narrow down what to try first, it&apos;s easy to default to doing nothing or to only stick with what you already know.
            </p>
          </div>
        </section>


        {/* =========================================================
            4. 3-STEP PROCESS GRID ("How it works")
        ========================================================= */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.badgeTag} style={{ marginBottom: "12px", display: "inline-block" }}>The Process</span>
            <h2 className={styles.sectionHeadline}>How it works</h2>
            <p className={styles.sectionSubtitle}>
              SlugPath is a conversational AI platform to help students find their place at UC Santa Cruz.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>Step 01</span>
              <h3 className={styles.stepTitle}>Explore &amp; Search</h3>
              <p className={styles.stepDesc}>
                SlugPath talks with students to figure out what they&apos;re looking for &mdash; their interests, what kind of people they want to meet, and what they&apos;re curious about trying.
              </p>
              <div className={styles.stepVisualContainer}>
                <div className={styles.stepCategoryChips}>
                  <span className={`${styles.stepCategoryChip} ${styles.stepCategoryChipActive}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                    </svg>
                    Interests
                  </span>
                  <span className={styles.stepCategoryChip}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Meet People
                  </span>
                  <span className={styles.stepCategoryChip}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    Curious to Try
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>Step 02</span>
              <h3 className={styles.stepTitle}>Connect</h3>
              <p className={styles.stepDesc}>
                Based on that conversation, it connects them to a specific experience on campus: a club, an event, or a class where they could meet people with similar interests.
              </p>
              <div className={styles.stepVisualContainer}>
                <div className={styles.stepConnectCard}>
                  <div className={styles.stepConnectButton} style={{ background: "#0284c7" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Club, Event, or Class
                    </span>
                  </div>
                  <div className={styles.stepConnectMeta}>
                    <span>Targeted Experience</span>
                    <span>Shared Interests</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.stepCard}>
              <span className={styles.stepBadge}>Step 03</span>
              <h3 className={styles.stepTitle}>Reflect</h3>
              <p className={styles.stepDesc}>
                After the student goes, SlugPath checks back in to hear how it went. Then the cycle repeats: explore, visit, and reflect.
              </p>
              <div className={styles.stepVisualContainer}>
                <div className={styles.stepReflectPreview}>
                  <div className={styles.reflectHeader}>
                    <span className={styles.reflectBadge}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        Check-in
                      </span>
                    </span>
                    <span className={styles.reflectStatus}>&quot;How was it?&quot;</span>
                  </div>
                  <div className={styles.reflectCycleText}>
                    Explore → Visit → Reflect
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. KEY CAPABILITIES
        ========================================================= */}
        <section className={styles.bentoSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.badgeTag} style={{ marginBottom: "12px", display: "inline-block" }}>Core Features</span>
            <h2 className={styles.sectionHeadline}>Key Capabilities</h2>
            <p className={styles.sectionSubtitle}>
              Built to listen, adapt, and keep students in complete control.
            </p>
          </div>

          <div className={styles.capabilitiesGrid}>
            {/* Capability 1: Personalized recommendations */}
            <div className={styles.capabilityCard}>
              <span className={styles.badgeTag} style={{ width: "fit-content" }}>
                Adapts Over Time
              </span>
              <h3 className={styles.stepTitle}>Personalized recommendations</h3>
              <p className={styles.stepDesc}>
                As you talk with SlugPath, it picks up on details about you (your interests, what you&apos;ve enjoyed or not enjoyed, what you&apos;re looking for) and builds a profile from them. That profile is what lets recommendations get more personalized over time and also helps to elicit patterns for what you gravitate towards.
              </p>
              <div className={styles.aiChatPreview}>
                <div className={styles.aiChatUser}>
                  &quot;I loved robotics projects in high school, but haven&apos;t found smaller project teams here yet.&quot;
                </div>
                <div className={styles.aiChatBot}>
                  <div>
                    Profile updated with <span className={styles.aiRecPill}>Hands-on Projects</span> and <span className={styles.aiRecPill}>Small Teams</span>. Recommending <span className={styles.aiRecPill}>SlugSat Satellite Team</span> build sessions!
                  </div>
                </div>
              </div>
            </div>

            {/* Capability 2: Memory */}
            <div className={styles.capabilityCard}>
              <span className={styles.badgeTag} style={{ width: "fit-content" }}>
                In Your Control
              </span>
              <h3 className={styles.stepTitle}>Memory</h3>
              <p className={styles.stepDesc}>
                Since this profile is crucial to SlugPath&apos;s suggestions, accuracy matters. As a user, you are in control of seeing your profile and editing anything that&apos;s wrong. Additionally, the system checks before assuming. When SlugPath draws a conclusion from something you said indirectly, it will ask you to confirm its understanding before saving it, rather than silently storing a guess.
              </p>
              <div className={styles.confirmationPreview}>
                <div className={styles.confirmPrompt}>
                  <div className={styles.confirmIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <strong style={{ fontSize: "12.5px", color: "#111827" }}>Checks before assuming</strong>
                    <p style={{ margin: "2px 0 0", color: "#475569", fontSize: "12px", lineHeight: "1.4" }}>
                      &quot;It sounds like you prefer creative coding workshops over hackathons. Should I save this to your profile?&quot;
                    </p>
                  </div>
                </div>
                <div className={styles.confirmActions}>
                  <span className={styles.confirmBtnPrimary}>✓ Confirm &amp; Save</span>
                  <span className={styles.confirmBtnSecondary}>Edit Profile</span>
                </div>
              </div>
            </div>

            {/* Capability 3: Follow-up reminder */}
            <div className={styles.capabilityCard}>
              <span className={styles.badgeTag} style={{ width: "fit-content" }}>
                Continuous Reflection
              </span>
              <h3 className={styles.stepTitle}>Follow-up reminder</h3>
              <p className={styles.stepDesc}>
                When you tell SlugPath you&apos;re planning to attend an event, a meeting, or a class visit, it schedules a follow-up reminder for afterward. That reminder prompts you to come back and tell SlugPath how the visit went: what you liked, what you didn&apos;t, etc. That reflection is what feeds back into your profile and helps to customize future suggestions.
              </p>
              <div className={styles.reminderPreview}>
                <div className={styles.reminderHeader}>
                  <div className={styles.reminderBell}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <div>
                    <strong style={{ fontSize: "12.5px", color: "#111827" }}>Scheduled Follow-Up</strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>After Tuesday&apos;s CruzHacks Onboarding</div>
                  </div>
                </div>
                <div className={styles.reminderPromptBox}>
                  &quot;How was the CruzHacks meeting? What did you enjoy, and what wasn&apos;t quite for you?&quot;
                </div>
                <div className={styles.reminderMeta}>
                  <span>✓ Reflection feeds back into future suggestions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. GOOD TO KNOW (Reframed Positive Scope & Guardrails)
        ========================================================= */}
        <section className={styles.goodToKnowSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.badgeTag} style={{ marginBottom: "12px", display: "inline-block" }}>Expectations</span>
            <h2 className={styles.sectionHeadline}>Good to Know</h2>
            <p className={styles.sectionSubtitle}>
              SlugPath is built to guide your campus journey responsibly. Here are a few important principles to keep in mind.
            </p>
          </div>

          <div className={styles.goodToKnowGrid}>
            {/* Item 1 */}
            <div className={styles.goodToKnowCard}>
              <div className={styles.goodToKnowTop}>
                <div className={styles.goodToKnowIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <h3 className={styles.goodToKnowTitle}>Community &amp; Belonging Focus</h3>
              </div>
              <p className={styles.goodToKnowText}>
                SlugPath helps you discover social, cultural, and extracurricular life outside class. For degree requirements and major planning, consult your official College or Major Academic Advisor.
              </p>
            </div>

            {/* Item 2 */}
            <div className={styles.goodToKnowCard}>
              <div className={styles.goodToKnowTop}>
                <div className={styles.goodToKnowIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <h3 className={styles.goodToKnowTitle}>Exploration, Not Enrollment</h3>
              </div>
              <p className={styles.goodToKnowText}>
                We recommend interesting organizations and classes to explore, but cannot check real-time seat counts or live enrollment status on MyUCSC.
              </p>
            </div>

            {/* Item 3 */}
            <div className={styles.goodToKnowCard}>
              <div className={styles.goodToKnowTop}>
                <div className={styles.goodToKnowIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className={styles.goodToKnowTitle}>Student Project Experience</h3>
              </div>
              <p className={styles.goodToKnowText}>
                Discover student-run project teams, hackathons, and pre-professional societies. For official career coaching and resume reviews, connect with UCSC Career Success.
              </p>
            </div>

            {/* Item 4 */}
            <div className={styles.goodToKnowCard}>
              <div className={styles.goodToKnowTop}>
                <div className={styles.goodToKnowIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </div>
                <h3 className={styles.goodToKnowTitle}>Human-Vetted Directory</h3>
              </div>
              <p className={styles.goodToKnowText}>
                Every organization was manually researched and verified by our student team. If information changes or looks inactive, let us know and we&apos;ll update it promptly.
              </p>
            </div>

            {/* Item 5 */}
            <div className={styles.goodToKnowCard}>
              <div className={styles.goodToKnowTop}>
                <div className={styles.goodToKnowIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                <h3 className={styles.goodToKnowTitle}>Direct Event Access</h3>
              </div>
              <p className={styles.goodToKnowText}>
                SlugPath surfaces exciting events and meeting dates, then connects you straight to the organization&apos;s official RSVP form or linktree so you retain full control.
              </p>
            </div>

            {/* Item 6 */}
            <div className={styles.goodToKnowCard}>
              <div className={styles.goodToKnowTop}>
                <div className={styles.goodToKnowIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className={styles.goodToKnowTitle}>Verified Community Links</h3>
              </div>
              <p className={styles.goodToKnowText}>
                We link directly to active club Discord servers and Instagram pages so you can always double-check day-of room changes, rain locations, or schedule shifts.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            7. FINAL CALL TO ACTION ("Ready to find your community?")
        ========================================================= */}
        <section className={styles.finalCtaSection}>
          <div className={styles.finalCtaCard}>
            <span className={styles.badgeTag}>Get Started</span>
            <h2 className={styles.ctaTitle}>Ready to find your community?</h2>
            <p className={styles.ctaSubtitle}>
              Chat with SlugPath to explore your interests, build your profile,
              and connect with clubs, events, and people across UC Santa Cruz.
            </p>

            <div className={styles.ctaButtons}>
              <Link
                href="https://chat.slughub.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.pillBtn} ${styles.pillBtnPrimary}`}
                style={{ padding: "12px 24px", fontSize: "15px" }}
              >
                <span>Chat with SlugPath</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/"
                className={`${styles.pillBtn} ${styles.pillBtnSecondary}`}
                style={{ padding: "12px 20px", fontSize: "15px" }}
              >
                Browse Club Directory
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
                    alt="SlugPath Portal Icon"
                    width={28}
                    height={28}
                    style={{ width: "auto", height: "auto" }}
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
                <span className={styles.footerColTitle}>Student Support</span>
                <a
                  href="https://slugsupport.ucsc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  Slug Support Network
                </a>
                <a
                  href="https://events.ucsc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  Campus Events Calendar
                </a>
                <a
                  href="https://resourcecenters.ucsc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  Resource Centers
                </a>
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

      <ChatBubble mode="exit" />
    </main>
  );
}
