import { NextResponse } from "next/server";

export function middleware(request) {
  const origin = request.headers.get("origin") || "*";
  const requestedHeaders = request.headers.get(
    "access-control-request-headers"
  );
  const allowHeaders = requestedHeaders || "Content-Type, Authorization";

  // For non-OPTIONS requests, pass through and add headers
  if (request.method !== "OPTIONS") {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set("Access-Control-Allow-Headers", allowHeaders);
    response.headers.set("Access-Control-Max-Age", "86400");
    return response;
  }

  // Handle CORS preflight explicitly
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": allowHeaders,
      "Access-Control-Max-Age": "86400",
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
