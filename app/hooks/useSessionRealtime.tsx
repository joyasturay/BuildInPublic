"use client"
import {useEffect,useRef,useState} from "react"
import axios from "axios"
import { supabase } from "@/supabase"
type chatMessage={
    id?:string;
    userId:string;
    username:string;
    text:string;
    createdAt?:string;
}
export function useSessionRealtime(sessionid?:string){
    const[connected,setConnected]=useState(false);
    const[viewers,setViewers]=useState<number>(0);
    const[messages,setMessages]=useState<chatMessage[]>([]);
    const userRef=useRef<{id:string,username:string} | null>(null);
    const channelRef=useRef<any>(null);
    const anonIdRef = useRef<string | null>(null);
  if (!anonIdRef.current) anonIdRef.current = `anon-${Math.random().toString(36).slice(2)}`;
  useEffect(()=>{
    if(!sessionid)return;
    let mounted=true;
    (async()=>{
        try{
            const res=await axios.get("/api/me",{withCredentials:true});
            if(!mounted)return;
            const data=res.data;
            if(data?.user){
                userRef.current={id:data.user.id,username:data.user.username}
            }
        }catch(e){
       console.log(e) 
    }
    connect()
    })()
    function connect(){
        
    }
  },[])
}