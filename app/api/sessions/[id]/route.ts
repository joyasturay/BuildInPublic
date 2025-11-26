import { NextRequest,NextResponse } from "next/server";
import {prisma} from "@/db"
export async function GET(req:NextRequest,{params}:{params:{id:string}}){
    const session=await prisma.session.findUnique({
        where:{
            id:params.id
        },
        include:{creator:true}
    }
    )
    if(!session)return NextResponse.json({
        message:"no session found"
    },{status:404})
    return NextResponse.json({session})
}