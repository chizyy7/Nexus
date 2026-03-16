import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSM2, Rating } from "@/lib/sm2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(0).max(5) as z.ZodType<Rating>,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: problemId } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userProblem = await prisma.userProblem.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId,
        },
      },
    });

    if (!userProblem) {
      return NextResponse.json(
        { error: "Problem not started" },
        { status: 404 }
      );
    }

    const result = calculateSM2(
      {
        easeFactor: userProblem.easeFactor,
        interval: userProblem.interval,
        repetitions: userProblem.repetitions,
      },
      parsed.data.rating
    );

    let status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" = "LEARNING";
    if (result.repetitions >= 5 && result.easeFactor >= 2.0) {
      status = "MASTERED";
    } else if (result.repetitions >= 1) {
      status = "REVIEW";
    }

    const updated = await prisma.userProblem.update({
      where: { id: userProblem.id },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
        lastReviewedAt: new Date(),
        status,
      },
    });

    return NextResponse.json({ userProblem: updated });
  } catch (error) {
    console.error("Error reviewing problem:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
