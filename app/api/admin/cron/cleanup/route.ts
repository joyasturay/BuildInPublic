import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { rollbar } from "@/rollbar";

export const runtime="nodejs"
export const dynamic="force-dynamic"

export async function POST(req:Request){
    const secret=(req.headers.get("x-cron-secret") || await req.json().then((b:any)=>b?.secret).catch((e)=>{
        null;
    }))
    if(!secret || secret!=process.env.CRON_SECRET){
        return NextResponse.json({
            message:"Invalid cron cred"
        },{
            status:403
        })
    }
    try{
        const MAX_MIN=Number(process.env.MAX_SESSION_DURATION??90)
        const cuttOff=new Date(Date.now()-MAX_MIN*60*1000)
        const stale =await prisma.session.findMany({
            where:{
                isLive:true,
                startedAt:{
                    lt:cuttOff
                }
            }
        })
        if(stale.length==0)return NextResponse.json({
            ok:true,
            cleaned:0
        })
        const ids=stale.map((s)=>s.id)
        await prisma.session.updateMany({
            where:{
                id: { in: ids }
            },
            data:{
                isLive:false,
                endedAt:new Date()
            }
        })
          rollbar.info("Cron cleanup endpoint ran", { count: ids.length, ids });
          return NextResponse.json({ ok: true, cleaned: ids.length });
    }catch(e:any){
        rollbar.error("cron endpoint failed",e)
        return NextResponse.json({
            ok:false
        },{
            status:500
        })
    }
}