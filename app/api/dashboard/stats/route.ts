import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const totalSeen = await prisma.userProblem.count({
      where: { userId },
    });

    const totalMastered = await prisma.userProblem.count({
      where: { userId, status: "MASTERED" },
    });

    const masteryPercentage =
      totalSeen > 0 ? Math.round((totalMastered / totalSeen) * 100) : 0;

    // Calculate streak
    const reviewDates = await prisma.userProblem.findMany({
      where: {
        userId,
        lastReviewedAt: { not: null },
      },
      select: { lastReviewedAt: true },
      orderBy: { lastReviewedAt: "desc" },
    });

    let streak = 0;
    if (reviewDates.length > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const uniqueDays = new Set<string>();
      for (const r of reviewDates) {
        if (r.lastReviewedAt) {
          const d = new Date(r.lastReviewedAt);
          d.setUTCHours(0, 0, 0, 0);
          uniqueDays.add(d.toISOString());
        }
      }

      const sortedDays = Array.from(uniqueDays).sort().reverse();
      const todayStr = today.toISOString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString();

      if (sortedDays[0] !== todayStr && sortedDays[0] !== yesterdayStr) {
        streak = 0;
      } else {
        let checkDate = new Date(sortedDays[0]);
        for (const dayStr of sortedDays) {
          const day = new Date(dayStr);
          if (day.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({ totalSeen, streak, masteryPercentage });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
