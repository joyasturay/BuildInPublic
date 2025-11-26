"use client"
import { useParams } from "next/navigation";
import { useState,useEffect } from "react";
import axios from "axios"
export default function LivePage(){
    const {id}=useParams()
    const[session,setSession]=useState<any>(null)

    useEffect(()=>{
        async function fetchSession(){
            const ses=await axios.get(`/api/sessions/${id}`)
            const res=ses.data.session
            setSession(res)
        }
        fetchSession()
    },[id])
    if(!session)return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
    return(
    <div className="h-screen w-screen bg-black text-white flex flex-col">
  <div className="p-4 shrink-0">
    <h1 className="text-2xl font-bold">{session.title}</h1>
    <p className="text-gray-400 text-sm">
      By {session.creator?.username || "Unknown"}
    </p>
  </div>
  <div className="flex-1 w-full h-full">
    <iframe
      src={session.joinUrl}
      allow="camera; microphone; fullscreen; display-capture"
      className="w-full h-full border-none"
    />
  </div>
</div>


    )
}