import { NextRequest, NextResponse } from "next/server";
import {prisma} from"@/db"
import bcrypt from "bcrypt"
import {z} from "zod"
import {signJWT} from "@/jwt"
import { buildAuthCookie } from "@/cookies";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bodySchema=z.object({
    email:z.string().email(),
    password:z.string()
})
export async function POST(req:NextRequest){
    const body=await req.json();
    const parsed=bodySchema.safeParse(body);
    if(!parsed.success){
        return NextResponse.json({
            message:"bad inputs"
        },{
            status:400
        })
    }
    const {email,password}=parsed.data;
    try{
    const user=await prisma.user.findUnique({
        where:{email:email},
    })
    if(!user){
        return NextResponse.json({
            message:"user not found"
        },{
            status:401
        })
    }
        const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
       const token=signJWT({UserId:user?.id})
       const cookie=buildAuthCookie(token)
       const safeUser = { id: user?.id, username: user?.username, email: user?.email, createdAt: user?.createdAt };
  const res = NextResponse.json({ user: safeUser }, { status: 200 });
  res.headers.set("Set-Cookie", cookie);
  return res;
    }catch(e){
        return NextResponse.json({
            message:"error occurred dont't worry",
            error:e
        },{
            status:500
        })
    }
} 
