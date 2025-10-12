import jwt, { Secret } from "jsonwebtoken";
const JWT_SECRET:string=process.env.JWT_SECRET as string 
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in env");
export function signJWT(payload: Record<string,any>) {
  return jwt.sign(payload, JWT_SECRET);
}
export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (e) {
    return null;
  }
}