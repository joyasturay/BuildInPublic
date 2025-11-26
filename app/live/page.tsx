"use client";
import { useEffect, useState } from "react";
import axios from "axios"
export default function LiveSessions(){
    const[sessions,setSessions]=useState<any[]>([])
    useEffect(()=>{
        async function fetchSessions(){
            const sess=await axios.get("/api/sessions/live")
            const res=sess.data.allsessions
            setSessions(res)
        }
        fetchSessions()
    },[])
    return(
        <div className="w-screen h-screen bg-gray-900 text-white">
            <h1>Live Sessions</h1>
            <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((s) => (
          <a
            href={`/live/${s.id}`}
            key={s.id}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
          >
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="text-gray-400 text-sm">
              By {s.creator?.username}
            </p>
          </a>
        ))}
      </div>
        </div>
    )
}