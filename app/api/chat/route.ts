import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().nullable(),
  problemId: z.string().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      const sessions = await prisma.chatSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ sessions });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, sessionId, problemId } = parsed.data;

    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
      if (!chatSession || chatSession.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
    } else {
      // Generate title from first message
      let title = "New Chat";
      try {
        const titleResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20250514",
          max_tokens: 30,
          messages: [
            {
              role: "user",
              content: `Generate a short title (max 10 words, plain text, no quotes) for a chat that starts with: "${message}"`,
            },
          ],
        });
        const titleBlock = titleResponse.content[0];
        if (titleBlock.type === "text") {
          title = titleBlock.text.slice(0, 100);
        }
      } catch {
        // Use default title
      }

      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          problemId,
          title,
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "USER",
        content: message,
      },
    });

    // Get conversation history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: chatSession.id },
      orderBy: { createdAt: "asc" },
    });

    // Build system prompt
    let systemPrompt: string;
    if (problemId) {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      });
      if (problem) {
        systemPrompt = `You are a math tutor helping a university student understand a problem.

Problem:
${problem.body}

Solution (do not reveal unless the student explicitly asks for it):
${problem.solution}

Your role:
- Guide the student toward understanding, not just the answer
- Ask Socratic questions when they're stuck
- Explain the underlying concept when needed
- Use LaTeX for all mathematical notation, wrapped in $...$ for inline and $$...$$ for display
- Be concise — this is a chat interface, not an essay
- If the student asks to just see the solution, you may show it`;
      } else {
        systemPrompt =
          "You are a helpful mathematics assistant for university students. Use LaTeX for all mathematical notation wrapped in $...$ for inline and $$...$$ for display math. Be clear, rigorous, and concise.";
      }
    } else {
      systemPrompt =
        "You are a helpful mathematics assistant for university students. Use LaTeX for all mathematical notation wrapped in $...$ for inline and $$...$$ for display math. Be clear, rigorous, and concise.";
    }

    const messages = history.map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ sessionId: chatSession.id })}\n\n`
            )
          );

          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-5-20250514",
            max_tokens: 2048,
            system: systemPrompt,
            messages,
          });

          let fullContent = "";

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullContent += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: text })}\n\n`
                )
              );
            }
          }

          // Save assistant message
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              role: "ASSISTANT",
              content: fullContent,
            },
          });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: "Sorry, an error occurred." })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
