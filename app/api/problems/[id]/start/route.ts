import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: problemId } = await params;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.userProblem.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ userProblem: existing });
    }

    const userProblem = await prisma.userProblem.create({
      data: {
        userId: session.user.id,
        problemId,
        status: "LEARNING",
        nextReviewAt: new Date(),
      },
    });

    return NextResponse.json({ userProblem }, { status: 201 });
  } catch (error) {
    console.error("Error starting problem:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
