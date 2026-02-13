import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "mydefaultjwtsecret"; // Use a strong secret in production

export function verifyJWT(req) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const { token } = cookie.parse(cookies);
    const authHeader = req.headers.get("authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;
    const jwtToken = token || bearerToken;

    if (!jwtToken) {
      return null;
    }
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
// Example usage in an API route:
// import { verifyJWT } from "@/lib/auth";
// const user = verifyJWT(req);
// if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
