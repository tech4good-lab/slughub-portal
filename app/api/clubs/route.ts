  import { NextResponse } from "next/server";
  import { prisma } from "@/lib/prisma";
  import { sendMail } from "@/lib/mail";

  const ONE_YEAR_IN_MS = 60 * 1000;
  const REMINDER_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

  async function checkAndSendReminders() {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - ONE_YEAR_IN_MS);
    const reminderCooldownDate = new Date(now.getTime() - REMINDER_COOLDOWN_MS);

    const clubsNeedingReminders = await prisma.club.findMany({
      where: {
        status: "approved",
        updatedAt: { lt: oneYearAgo },
        OR: [
          { lastUpdateSentAt: null },
          { lastUpdateSentAt: { lt: reminderCooldownDate } },
        ],
      },
    });

    if (clubsNeedingReminders.length === 0) {
      return {checked: 0, sent: 0, failed: 0};
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const club of clubsNeedingReminders) {
      try {
        const ok = await sendMail({
          to: [club.contactEmail],
          subject: "Reminder: Update Your Club Information",
          text: `...`,
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

  export async function GET() {
    try {
      const approvedClubs = await prisma.club.findMany({
        where: {
          name: "Arya's Test",
          status: "approved",
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const clubs = approvedClubs.map((club: any) => ({
        recordId: club.id,
        ...club,
      }));

      const reminderStats = await checkAndSendReminders();
      console.log(`Checked ${reminderStats.checked} clubs, sent ${reminderStats.sent} reminders, failed to send ${reminderStats.failed} reminders.`);

      return NextResponse.json({ clubs });
    } catch (error) {
      console.error("Prisma Error fetching approved clubs:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
