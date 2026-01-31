const origin =
  process.env.FRONTEND_ORIGIN && process.env.FRONTEND_ORIGIN.trim().length > 0
    ? process.env.FRONTEND_ORIGIN.trim()
    : "http://localhost:5173";

let corsHeaders = {
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;
