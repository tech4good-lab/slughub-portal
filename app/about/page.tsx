import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Navbar from "@/app/components/Navbar";
import ChatBubble from "@/app/components/ChatBubble";
import Footer from "@/app/components/Footer";
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

            {/* Right Hero Column: Framed Video Canvas */}
            <div className={styles.heroRight}>
              <div className={styles.mockupCard}>
                <div className={styles.mockupImageContainer}>
                  <video
                    src="/slugpath-promo.mp4"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={styles.mockupVideo}
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
              <div className={styles.stepHeaderArea}>
                <h3 className={styles.stepTitle}>Explore</h3>
                <p className={styles.stepDesc}>
                  Talk with SlugPath about your interests, the kind of environment you thrive in, and what you&apos;re curious to try.
                </p>
              </div>
              <div className={styles.stepVisualContainer}>
                <Image
                  src="/explore2.png"
                  alt="Explore conversation with SlugPath"
                  width={1078}
                  height={950}
                  className={styles.stepImage}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <div className={styles.stepHeaderArea}>
                <h3 className={styles.stepTitle}>Visit</h3>
                <p className={styles.stepDesc}>
                  Based on your conversation, SlugPath points you toward concrete places to check out, like a club meeting, an upcoming event, or a class you can sit in on, with zero pressure to commit.
                </p>
              </div>
              <div className={styles.stepVisualContainer}>
                <Image
                  src="/visit.png"
                  alt="Visit recommendations from SlugPath"
                  width={1068}
                  height={834}
                  className={styles.stepImage}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.stepCard}>
              <div className={styles.stepHeaderArea}>
                <h3 className={styles.stepTitle}>Reflect</h3>
                <p className={styles.stepDesc}>
                  After you check something out, SlugPath checks in to hear how it felt. It remembers your takeaways so each conversation builds on the last, helping you figure out what actually fits.
                </p>
              </div>
              <div className={styles.stepVisualContainer}>
                <Image
                  src="/reflect2.png"
                  alt="Reflect check-in with SlugPath"
                  width={1060}
                  height={986}
                  className={styles.stepImage}
                />
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
              <div className={styles.stepHeaderArea}>
                <h3 className={styles.stepTitle}>A guide that remembers</h3>
                <p className={styles.stepDesc}>
                  SlugPath remembers what you&apos;ve talked about over time. It keeps track of what you&apos;re curious about and how past events felt, so future suggestions actually make sense for where you are.
                </p>
              </div>
              <div className={styles.stepVisualContainer}>
                <Image
                  src="/memory.png"
                  alt="A guide that remembers conversation with SlugPath"
                  width={1036}
                  height={632}
                  className={styles.stepImage}
                />
              </div>
            </div>


            {/* Capability 2: Timely check-ins */}
            <div className={styles.capabilityCard}>
              <div className={styles.stepHeaderArea}>
                <h3 className={styles.stepTitle}>Timely check-ins</h3>
                <p className={styles.stepDesc}>
                  Planning to check out a community, event, or class? SlugPath can follow up afterward to hear what worked and what felt off, so you have space to process the experience.
                </p>
              </div>
              <div className={styles.stepVisualContainer}>
                <Image
                  src="/followup2.png"
                  alt="Timely check-ins follow-up conversation with SlugPath"
                  width={1054}
                  height={826}
                  className={styles.stepImage}
                />
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

        <Footer style={{ marginTop: 40, padding: "20px 0 32px" }} />
      </div>

      <ChatBubble mode="exit" />
    </main>
  );
}
