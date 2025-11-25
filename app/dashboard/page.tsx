"use client";

import { useRouter } from "next/navigation";
import useRequireAuth from "../hooks/useRequireAuth";
import { useState } from "react";
import axios from "axios"
export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  //router,title,tags,creating booolean
  const router=useRouter();
  const [title,setTitle]=useState("");
  const [tags,setTags]=useState("");
  const[creating,setCreating]=useState(false);
  const[error,setError]=useState<string | null>(null)
  function extractValidationError(messageObj: any): string | null {
  if (Array.isArray(messageObj.formErrors) && messageObj.formErrors.length > 0) {
    return messageObj.formErrors[0];
  }

  if (messageObj.fieldErrors && typeof messageObj.fieldErrors === "object") {
    const all = Object.values(messageObj.fieldErrors)
      .flat()
      .filter(Boolean);
    if (all.length > 0) return String(all[0]);
  }

  return null;
}

  async function handleLive(e:React.FormEvent){
    e.preventDefault();
    setCreating(true);
    setError(null)
    try{
      const createSession=await axios.post("/api/sessions",{title,tags:tags.split(",").map((t)=>t.trim())})
      const res=createSession.data;
      setCreating(false);
      router.push(`/live/${res.session.id}`)
    }catch(err:any){
     console.error(err);

      let friendly = "Something went wrong. Please try again.";

      const data = err?.response?.data;

      // If backend sends validation error like { message: { formErrors, fieldErrors } }
      if (data?.message) {
        if (typeof data.message === "string") {
          friendly = data.message;
        } else if (typeof data.message === "object") {
          // handle formErrors / fieldErrors shape
          const msg = extractValidationError(data.message);
          if (msg) friendly = msg;
        }
      } else if (typeof data?.error === "string") {
        friendly = data.error;
      } else if (err?.message) {
        friendly = err.message;
      }

      setError(friendly);
    }finally{
      setCreating(false)
    }
  }

  if (loading) return (
     <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
  );
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <h1 className="text-3xl font-bold">Hey {user?.username || "Dev"} 👋</h1>
      <p className="text-gray-400 mt-2">Welcome to your DevStream dashboard.</p>
      <div className="bg-gray-800/80 rounded-2xl shadow-lg p-5 border border-gray-700">
      <h2>Create a new live session</h2>
      <form onSubmit={handleLive} className="space-x-5">
        <input type="text" value={title} onChange={(e)=>(
          setTitle(e.target.value)
        )} className="w-full border-b outline-none mt-2" placeholder="Enter the title for the event" required/>
         <input type="text" value={tags} onChange={(e)=>(
          setTags(e.target.value)
        )} className="w-full border-b outline-none mt-3" placeholder="Enter the tags for the event" required/>
        <button className="bg-blue-500 rounded-md text-center w-full mt-3 p-4">
          {creating?"creating...":"create"}
        </button>
      </form>
      </div>
    </div>
  );
}
