import { rollbar } from "./rollbar";
import { getCurrentUser } from "./auth";

export  async function withUserContext<T>(req:Request,callback:(user:any)=>Promise<T>){
    const user=await getCurrentUser(req);
    if(user){
        rollbar.configure({
            payload:{
                person:{
                    id:user.id,
                    username:user.username,
                    email:user.email
                }
            }
        })
    }else{
        rollbar.configure({
            payload:{
                person:undefined
            }
        })
    }
}