"use client"
import {useEffect,useRef,useState} from "react"
import axios from "axios"
import { supabase } from "@/supabase"
import { object } from "zod"
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
       alert(String(e)) 
    }
    connect()
    })()
    function connect(){
        const presenceKey=userRef.current?.id ?? anonIdRef.current;
        const channel=supabase.channel(`session-${sessionid}`,{
          config:{
            presence:{
              key:presenceKey !
            }
          }
        })
        channel.on("broadcast",{event:"chat-meesage"},(payload)=>{
          const msg=payload.payload as chatMessage
          setMessages((m)=>[...m,msg])
        })
        channel.on("broadcast", { event: "viewer-join" }, (payload) => {
        // optional: show join notifications
      });
        channel.on("presence",{event:"sync"},()=>{
          try{
            const state=channel.presenceState()
            const count=Object.keys(state).length
            setViewers(count)
          }catch(e:any){
            alert(String(e));
          }
        })
          channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
          const user = userRef.current;
          channel.send({
            type: "broadcast",
            event: "viewer-join",
            payload: { userId: user?.id, username: user?.username },
          });
        }
      });

      channelRef.current = channel;
    }
    return()=>{
      mounted=false;
      if(channelRef.current){
        try{
          channelRef.current.unsubscribe()
        }catch{}
        channelRef.current=null;
      }
    }
  },[sessionid])
}