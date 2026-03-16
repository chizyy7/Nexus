import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dueProblems = await prisma.userProblem.findMany({
      where: {
        userId: session.user.id,
        nextReviewAt: { lte: new Date() },
      },
      include: {
        problem: {
          include: { topic: true },
        },
      },
      orderBy: { nextReviewAt: "asc" },
      take: 10,
    });

    return NextResponse.json({ problems: dueProblems });
  } catch (error) {
    console.error("Error fetching due problems:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
