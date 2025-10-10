// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db";
import axios from "axios";
import slugify from "slugify";

const bodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  creatorId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, tags = [], creatorId } = parsed.data;

  const demoUser =
    (creatorId ? await prisma.user.findUnique({ where: { id: creatorId } }) : null) ??
    (await prisma.user.upsert({
      where: { email: "demo@devstream.local" },
      update: {},
      create: { 
        email: "demo@devstream.local", username: "demo", password: "hashed" 
    },

    }));

  try {
    const roomName =
      `${slugify(title, { lower: true }).slice(0, 40)}-` +
      Math.random().toString(36).slice(2, 10);
    const joinUrl = `https://meet.jit.si/${roomName}`;

    const slug =
      `${slugify(title, { lower: true }).slice(0, 40)}-` +
      Math.random().toString(36).slice(2, 8);

    const session = await prisma.session.create({
      data: {
        title,
        description,
        tags,
        creatorId: demoUser.id,
        isLive: true,
        startedAt: new Date(),
        provider: "JITSI",      
        dailyRoomId: null,      
        joinUrl,
        slug,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (e: any) {
    console.error("Create session error:", e?.response?.data || e.message);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
