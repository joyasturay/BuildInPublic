import { NextResponse } from "next/server";
import {prisma} from"@/db"
import bcrypt from "bcrypt"
import {z} from "zod"
import {signJWT} from "@/jwt"
import { buildAuthCookie } from "@/cookies";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema=z.object({
    username:z.string().min(3),
    email:z.string().email(),
    password:z.string().min(6)
})

export async function POST(req:Request){
     const body=await req.json();
     const parsed=bodySchema.safeParse(body);
     if(!parsed.success)return NextResponse.json({
        message:"wrong format",
        error:parsed.error,
     },{
        status:400
     })
     const {username,email,password}=parsed.data;
     const exists=await prisma.user.findFirst({
        where:{
            OR:[{username},{email}]
        }
     })
     if(exists)return NextResponse.json({
        message:"A user with this emailId or Username already exists"
     })
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
        const hashed = await bcrypt.hash(password, saltRounds);
     const user=await prisma.user.create({
        data:{
            username,email,password:hashed
        },
        select:{id:true,username:true,email:true,createdAt:true}
     })
     const token=signJWT({userId:user.id})
     const cookie = buildAuthCookie(token);
  const res = NextResponse.json({ user }, { status: 201 });
  res.headers.set("Set-Cookie", cookie);
  return res;
}