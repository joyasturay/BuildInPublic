"use client"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation";
type signupcomp={
    username:string,
    password:string,
    email:string
}
export default function signup(){
    const [loading,setLoading]=useState(false);
    const [form,setForm]=useState<signupcomp>({username:"",email:"",password:""})
    const [error,setError]=useState("")
    const router=useRouter();
    async function handleSubmit(e:React.FormEvent){
        e.preventDefault()
        setError("")
       setLoading(true)
       try{
        const res=await axios.post("/api/auth/signup",form,{
            headers:{ "Content-Type": "application/json"}
        })
        const data= res.data
        if(!data)throw new Error(data.error || "signup failed")
            router.push("/dashboard")
       }catch(e:any){
        setError(e)
       }finally{
        setLoading(false)
       }
    }
    return(
        <div className="flex justify-center items-center bg-gray-900 text-white min-h-screen">
            <form onSubmit={handleSubmit} className=" p-6 w-130 space-y-6">
                 <h2 className="text-2xl font-bold ">Create your DevStream account</h2>
                <div>
                    <input type="text"
                    placeholder="username"
                    value={form.username}
                    onChange={(e)=>{
                        setForm({...form,username:e.target.value})
                    }} className="border-b w-full outline-none"required/>
                    
                </div>
                <div>
                 <input type="text"
                    placeholder="email"
                    value={form.email}
                    onChange={(e)=>{
                        setForm({...form,email:e.target.value})
                    }} className="border-b w-full outline-none" required/>
                    </div>
                     <div>
                 <input type="password"
                    placeholder="password"
                    value={form.password}
                    onChange={(e)=>{
                        setForm({...form,password:e.target.value})
                    }}className="border-b w-full outline-none" required/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                     <button
                     type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">
                    {loading ? "Creating..." : "Sign Up"}
                    </button>
                <p className="text-sm text-gray-400 text-center">
                     Already have an account?{" "}
                <a href="/login" className="text-blue-400 hover:underline">Login</a>
                </p>
             </form>
        </div>
    )
}