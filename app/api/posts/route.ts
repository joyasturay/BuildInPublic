import { getCurrentUser } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"
import {prisma} from"@/db"
const postSchema=z.object({
    title:z.string().min(1),
    description:z.string().min(3)
})
export async function GET(){
    const posts=await prisma.post.findMany({
        include:{author:true},
        orderBy:{createdAt:"desc"}
    })
    return NextResponse.json({posts})
}
export async function POST(req:NextRequest){
    const user=await getCurrentUser(req);
    if(!user){
        return NextResponse.json({
            message:"not logged in"
        },{status:400})
    }
    const body=await req.json();
    const parsed=postSchema.safeParse(body);
    if(!parsed.success){
        return NextResponse.json({
            message:"not valid inputs"
        },{
            status:400
        })
    }
    const savepost=await prisma.post.create({
            data:{
                title:parsed.data.title,
                content:parsed.data.description,
                authorId:user.id
            },include:{
                author:true
            }
        })
        return NextResponse.json({savepost})

}