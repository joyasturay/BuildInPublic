import { NextResponse } from "next/server";
import { prisma } from "@/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(){
    try{
        const sessions=await prisma.session.findMany({
            where:{
                isLive:true
            },
            orderBy:{
                startedAt:"desc"
            },
            include:{
                creator:{
                    select:{
                        id:true,
                        username:true
                    }
                }
            }
        })
        return NextResponse.json({
            allsessions:sessions
        })
    }catch(e){
        return NextResponse.json({
            message:"error in fetching sessions"
        },{
            status:500
        })
    }
}