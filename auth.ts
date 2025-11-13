import { verifyJwt } from "./jwt";
import { prisma } from "./db";

export async function getCurrentUser(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = m?.[1];
  if (!token) return null;

  const payload = verifyJwt<Record<string, any>>(token);
  const userId = payload?.userId ?? payload?.UserId;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, createdAt: true,bio:true,profilepic:true },
  });

  return user;
}
