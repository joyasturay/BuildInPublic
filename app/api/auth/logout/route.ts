import { NextRequest, NextResponse } from "next/server";
import {prisma} from"@/db"
import bcrypt from "bcrypt"
import {z} from "zod"
import {signJWT} from "@/jwt"
import { buildAuthCookie, clearAuthCookie } from "@/cookies";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(){
    const res=NextResponse.json({
        ok:true
    })
    res.headers.set("Set-Cookie",clearAuthCookie())
    return res;
}