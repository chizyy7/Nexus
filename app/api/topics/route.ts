import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topics = await prisma.topic.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            problems: {
              include: {
                userProblems: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        problems: {
          include: {
            userProblems: {
              where: { userId: session.user.id },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const topicsWithProgress = topics.map((topic) => {
      const childrenWithProgress = topic.children.map((child) => {
        const problemCount = child.problems.length;
        const masteredCount = child.problems.filter((p) =>
          p.userProblems.some((up) => up.status === "MASTERED")
        ).length;
        return {
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          problemCount,
          masteredCount,
          children: [],
        };
      });

      const totalProblems = childrenWithProgress.reduce(
        (sum, c) => sum + c.problemCount,
        0
      ) + topic.problems.length;
      const totalMastered = childrenWithProgress.reduce(
        (sum, c) => sum + c.masteredCount,
        0
      ) + topic.problems.filter((p) =>
        p.userProblems.some((up) => up.status === "MASTERED")
      ).length;

      return {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        problemCount: totalProblems,
        masteredCount: totalMastered,
        children: childrenWithProgress,
      };
    });

    return NextResponse.json({ topics: topicsWithProgress });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
