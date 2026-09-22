import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Navbar from "@/app/components/Navbar";
import ChatBubble from "@/app/components/ChatBubble";
import styles from "./about.module.css";

export const metadata = {
  title: "About | UCSC Community Portal",
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
      {/* Signature Directory Floating Ambient Bubbles */}
      <DecorativeBubbles />

      <div className={styles.contentLayer}>
        {/* Navigation Bar (Directory / About in center, Community Lead Login on right) */}
        <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />

        {/* =========================================================
            1. HERO SECTION (Granola Split Grid with Mockup Canvas)
        ========================================================= */}
        <section className={`${styles.sectionContainer} ${styles.heroSection}`}>
          <div className={styles.heroGrid}>
            {/* Left Hero Column */}
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle} style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <Image
                  src="/slugpath_logo.png"
                  alt="SlugPath Mascot"
                  width={80}
                  height={80}
                  style={{ borderRadius: 18 }}
                  priority
                  unoptimized
                />
                SlugPath
              </h1>

              <p className={styles.heroSubtitle}>
                Start with a conversation.
                Find your communities.
              </p>

              <div className={styles.heroButtons}>
                <Link
                  href="#get-started"
                  className={`${styles.pillBtn} ${styles.pillBtnPrimary}`}
                  style={{ padding: "12px 24px", fontSize: "15px" }}
                >
                  Join the Study!
                </Link>
              </div>
            </div>

            {/* Right Hero Column: Framed Mockup Canvas */}
            <div className={styles.heroRight}>
              <div className={styles.mockupCard}>
                <div className={styles.mockupImageContainer}>
                  <Image
                    src="/white_landing_page.png"
                    alt="UCSC Community Portal Landing Page"
                    width={2856}
                    height={1656}
                    priority
                    className={styles.mockupImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. MISSION SECTION
        ========================================================= */}
        <section className={styles.missionSection}>
          <div className={styles.missionCard}>
            <h2 className={styles.missionTitle}>
              Not sure what to check out first? Start here.
            </h2>
            <div className={styles.missionText}>
              <p style={{ margin: "0 0 14px" }}>
                Between events, classes, and communities, there&apos;s a lot going on at UCSC, and it&apos;s not always easy to know where to look.
              </p>
              <p style={{ margin: 0 }}>
                Even if you aren&apos;t sure what you&apos;re looking for yet, chat with SlugPath to talk through what sounds interesting and find a few low-stakes things worth trying.
              </p>
            </div>
          </div>
        </section>


        {/* =========================================================
            4. 3-STEP PROCESS GRID ("How it works")
        ========================================================= */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeaderCenter}>
            {/* <span className={styles.badgeTag} style={{ marginBottom: "12px", display: "inline-block" }}>The Process</span> */}
            <h2 className={styles.sectionHeadline}>How it works</h2>
            <p className={styles.sectionSubtitle}>
              SlugPath is an AI companion designed to help you explore what UC Santa Cruz has to offer and find your communities.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>Explore</h3>
              <p className={styles.stepDesc}>
                Talk with SlugPath about your interests, the kind of environment you thrive in, and what you&apos;re curious to try.
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
              <h3 className={styles.stepTitle}>Visit</h3>
              <p className={styles.stepDesc}>
                Based on your conversation, SlugPath points you toward concrete places to check out, like a club meeting, an upcoming event, or a class you can sit in on, with zero pressure to commit.
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
              <h3 className={styles.stepTitle}>Reflect</h3>
              <p className={styles.stepDesc}>
                After you check something out, SlugPath checks in to hear how it felt. It remembers your takeaways so each conversation builds on the last, helping you figure out what actually fits.
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
            <h2 className={styles.sectionHeadline}>Core Features</h2>
            <p className={styles.sectionSubtitle}>
              Built to listen, adapt, and keep students in complete control.
            </p>
          </div>

          <div className={styles.capabilitiesGrid}>
            {/* Capability 1: A guide that remembers */}
            <div className={styles.capabilityCard}>
              <h3 className={styles.stepTitle}>A guide that remembers</h3>
              <p className={styles.stepDesc}>
                SlugPath remembers what you&apos;ve talked about over time. It keeps track of what you&apos;re curious about and how past events felt, so future suggestions actually make sense for where you are.
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


            {/* Capability 2: Timely check-ins */}
            <div className={styles.capabilityCard}>
              <h3 className={styles.stepTitle}>Timely check-ins</h3>
              <p className={styles.stepDesc}>
                Planning to check out a community, event, or class? SlugPath can follow up afterward to hear what worked and what felt off, so you have space to process the experience.
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
            7. FINAL CALL TO ACTION ("Ready to find your community?")
        ========================================================= */}
        <section id="get-started" className={styles.finalCtaSection}>
          <div className={styles.finalCtaCard}>
            <h2 className={styles.ctaTitle} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <span>Ready to chat with SlugPath?</span>
              <Image
                src="/slugpath_logo.png"
                alt="SlugPath Mascot"
                width={68}
                height={68}
                style={{ borderRadius: 15 }}
                priority
                unoptimized
              />
            </h2>

            {/* Tech4Good Research Study Callout */}
            <div id="research-study" className={styles.studyCard}>
              <h3 className={styles.studyTitle}>
                Participate in our 5-week campus study &amp; earn a $30 gift card
              </h3>

              <p className={styles.studyDescription}>
                The Tech4Good Lab is running a 5-week study to understand how to best design tools that help students explore campus life and figure out what fits. Participation involves chatting with SlugPath and exploring in person, whether that is checking out a community, attending a campus event, or sitting in on a class. You&apos;ll complete four brief surveys over the 5 weeks to share how it went, and you&apos;ll receive a $30 gift card upon completing the study.
              </p>

              <div className={styles.studyActions}>
                <a
                  href="https://ucsantacruz.co1.qualtrics.com/jfe/form/SV_a5BfIizH1QCOAVE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.pillBtn} ${styles.pillBtnPrimary}`}
                  style={{ padding: "10px 22px", fontSize: "14.5px" }}
                >
                  <span>Enroll via Consent Form</span>
                  <svg
                    width="15"
                    height="15"
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
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>

      <ChatBubble mode="exit" />
    </main>
  );
}
