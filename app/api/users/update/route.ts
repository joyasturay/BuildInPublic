import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { prisma } from "@/db";
import { z } from "zod";
const bodySchema=z.object({
    username:z.string().optional(),
    bio:z.string().optional(),
    profilepic:z.string().optional()
})
export async function POST(req:Request){
    const user=await getCurrentUser(req);
    if(!user)return NextResponse.json({message:"unauthorized user"},{status:401})
        const body=await req.json();
    const parsed=bodySchema.safeParse(body);
    if(!parsed.success){
        return NextResponse.json({message:"invalid inputs"},{status:404})
    }
    const data=parsed.data
    const User=await prisma.user.update({
        where:{id:user.id},
        data
    })
     return NextResponse.json({ user: User });
}