import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/auth/server";
import { apiError } from "@/lib/api/errors";
import { requestId, requireSameOrigin } from "@/lib/api/request";
import { serverEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const id = requestId(request);
  try {
    requireSameOrigin(request);
    const configuredKey = serverEnv().ADMIN_DASHBOARD_KEY;
    const suppliedKey = request.headers.get("x-admin-key");
    if (!configuredKey || suppliedKey !== configuredKey) {
      throw Object.assign(new Error("Admin access required"), { status: 401 });
    }
    const snapshot = await getFirestore(adminApp())
      .collection("franchise_nominations")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    const nominations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ nominations }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return apiError(error, id);
  }
}
