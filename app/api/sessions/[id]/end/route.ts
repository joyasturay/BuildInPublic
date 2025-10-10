import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/db"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req:NextRequest,{params}:{params:{id:string}}){
    const {id}=params;
    if(!id)return NextResponse.json({message: "Missing session id" },{status:400})
        try{
            const updatedSession=await prisma.session.update({
                where:{id},
                data:{
                    isLive:false,
                    endedAt:new Date()
                }
            })
            return NextResponse.json({ updatedSession }, { status: 200 });
    }catch(e:any){
        console.error("End session error:", e.message);
    return NextResponse.json(
      { message: "Failed to end session" },
      { status: 500 }
    );
    }
}