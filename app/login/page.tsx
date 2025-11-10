"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import axios from "axios"
export default function loginPage(){
    const[error,setError]=useState("")
    const[loading,setLoading]=useState(false)
    const[form,setForm]=useState({email:"",password:""})
    const router=useRouter();
    async function handleSubmit(e:React.FormEvent){
        e.preventDefault()
        setError("")
        setLoading(true)
        try{
            const res=await axios.post("/api/auth/signin",form,
                {headers:{"Content-Type": "application/json"}}
            )
            const data= res.data;
            if(!data)throw new Error(data.error || "login failed")
                router.push("/dashboard")
        }catch(err:any){
           const friendly =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please try again."

      setError(String(friendly))
        }finally{
            setLoading(false)
        }
    }
    return(
        <>
          <div className="flex justify-center items-center bg-gray-900 text-white min-h-screen">
            <form onSubmit={handleSubmit} className=" p-6 w-130 space-y-6">
                 <h2 className="text-2xl font-bold ">Create your DevStream account</h2>
                <div>
                    <input type="text"
                    placeholder="email"
                    value={form.email}
                    onChange={(e)=>{
                        setForm({...form,email:e.target.value})
                    }} className="border-b w-full outline-none"required/>
                    
                </div>
                <div>
                 <input type="password"
                    placeholder="password"
                    value={form.password}
                    onChange={(e)=>{
                        setForm({...form,password:e.target.value})
                    }} className="border-b w-full outline-none" required/>
                    </div>
                    {error&& <p className="text-red-500 text-sm">{error}</p>}
                    <button 
                     type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">
                        {loading?"logging in...":"login"}
                    </button>
            </form>
          </div>
        </>
    )
}