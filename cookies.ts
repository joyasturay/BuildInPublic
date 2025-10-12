export function buildAuthCookie(token:string){
    const isProd=process.env.NODE_ENV=="production"
    const maxAge=60*60*24*7;
    const secure=isProd?"Secure; ":""
    return `token=${token}; HttpOnly; ${secure}Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
export function clearAuthCookie(){
    const isProd=process.env.NODE_ENV=="production"
     const secure=isProd?"Secure; ":""
      return `token=; HttpOnly; ${secure}Path=/; Max-Age=0; SameSite=Lax`;
}