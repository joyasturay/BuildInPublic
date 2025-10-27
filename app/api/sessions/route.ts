import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db";
import slugify from "slugify";
import { getCurrentUser } from "@/auth";
import { rollbar } from "@/rollbar";
import { checkRateLimit } from "@/rate-limit";

const bodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  return NextResponse.json({ message: "all ok", ok: true, expects: "POST" });
}

export async function POST(req: Request) {
  const start = Date.now();
  rollbar.log("API request", { route: "/api/sessions", method: "POST" });

  const json = await req.json().catch(() => null);
  rollbar.info("Create session payload received", { bodyPreview: { title: json?.title } });

  const parsed = bodySchema.safeParse(json);
  const user = await getCurrentUser(req);
  if (!user) {
    rollbar.warning("Unauthorized create session attempt", { route: "/api/sessions", body: { title: json?.title } });
    return NextResponse.json({ message: "Invalid user" }, { status: 401 });
  }

  if (!parsed.success) {
    rollbar.warning("Create session validation failed", { userId: user.id, errors: parsed.error.format() });
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, tags = [] } = parsed.data;
  const key=`user:${user.id}`
  const rateLimit=await checkRateLimit(key)
  if(!rateLimit.ok){
    rollbar.warning("Rate limit exceeded for session creation", { userId: user.id, count: rateLimit.count });
    return NextResponse.json({
      message: "Rate limit exceeded: too many session creations. Try again later.",
      retryAfter: rateLimit.resetIn,
    }, { status: 429 });
  }

  const existing = await prisma.session.findFirst({ where: { creatorId: user.id, isLive: true } });
  if (existing) {
    rollbar.info("User attempted to start new session while one already live", {
      userId: user.id,
      existingSessionId: existing.id,
    });
    return NextResponse.json({ message: "already session ongoing", session: existing }, { status: 400 });
  }

  try {
    const roomName = `${slugify(title, { lower: true }).slice(0, 40)}-${Math.random().toString(36).slice(2, 10)}`;
    const joinUrl = `https://meet.jit.si/${roomName}`;
    const slug = `${slugify(title, { lower: true }).slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`;

    const session = await prisma.session.create({
      data: {
        title,
        description,
        tags,
        creatorId: user.id,
        isLive: true,
        startedAt: new Date(),
        provider: "JITSI",
        dailyRoomId: null,
        joinUrl,
        slug,
      },
    });

    rollbar.info("User started a new session", { userId: user.id, sessionId: session.id, title });

    const ms = Date.now() - start;
    if (ms > 1000) {
      rollbar.warning("Slow session creation", { userId: user.id, sessionId: session.id, ms });
    } else {
      rollbar.log("Session creation latency", { ms, userId: user.id, sessionId: session.id });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (e: any) {
    rollbar.error("error occurred while creating a session", e, {
      userId: user?.id,
      route: "/api/sessions",
      bodyPreview: { title },
    });
    console.error("Create session error:", e?.response?.data || e.message);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
