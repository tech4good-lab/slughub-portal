  import { NextResponse } from "next/server";
  import { prisma } from "@/lib/prisma";
  import { sendMail } from "@/lib/mail";

  const ONE_YEAR_IN_MS = 365* 24 * 60 * 60 * 1000;
  const REMINDER_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

  async function checkAndSendReminders() {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - ONE_YEAR_IN_MS);
    const reminderCooldownDate = new Date(now.getTime() - REMINDER_COOLDOWN_MS);

    const clubsNeedingReminders = await prisma.club.findMany({
      where: {
        status: "approved",
        updatedAt: { lt: oneYearAgo },
        contactEmail: { not: null },
        OR: [
          { lastUpdateSentAt: null },
          { lastUpdateSentAt: { lt: reminderCooldownDate } },
        ],
      },
    });

    console.log(clubsNeedingReminders.length === 0 ? "No clubs need reminders." : `Found ${clubsNeedingReminders.length} clubs needing reminders.`);

    if (clubsNeedingReminders.length === 0) {
      return {checked: 0, sent: 0, failed: 0};
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const club of clubsNeedingReminders) {
      if (!club.contactEmail) continue; 
      
      try {
        const ok = await sendMail({
          to: [club.contactEmail],
          subject: "Reminder: Update Your Club Information",
          text: `Hello ${club.name}. As it's been over a year since your last update, please take a moment to update your club information on the SlugHub portal. Thank you!`,
        });
        if (ok) {
          await prisma.club.update({
            where: { id: club.id },
            data: { lastUpdateSentAt: now },
          });
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to send reminder for club ${club.id}:`, error);
        failedCount++;
      }
    }

    return { checked: clubsNeedingReminders.length, sent: sentCount, failed: failedCount }; 
  }

  export async function GET(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
      const reminderStats = await checkAndSendReminders();
      console.log(`Checked ${reminderStats.checked} clubs, sent ${reminderStats.sent} reminders, failed to send ${reminderStats.failed} reminders.`);
      return NextResponse.json({ message: "Reminders processed", stats: reminderStats });
    } catch (error) {
      console.error("Error processing reminders:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }