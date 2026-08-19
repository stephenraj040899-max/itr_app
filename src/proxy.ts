import { NextResponse, type NextRequest } from "next/server";

const isStaffPath = (pathname: string) => pathname === "/staff" || pathname.startsWith("/staff/");
const isStaffApi = (pathname: string) => pathname.startsWith("/api/staff/");

export function proxy(request: NextRequest) {
  const surface = process.env.APP_SURFACE === "STAFF" ? "STAFF" : "CLIENT";
  const { pathname } = request.nextUrl;

  if (surface === "CLIENT" && (isStaffPath(pathname) || isStaffApi(pathname))) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (surface === "STAFF") {
    if (pathname === "/") return NextResponse.redirect(new URL("/staff", request.url));
    if (!isStaffPath(pathname) && !isStaffApi(pathname)) return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers(request.headers);
  headers.set("x-taxright-surface", surface);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
