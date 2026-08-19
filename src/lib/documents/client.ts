const FIREBASE_API_KEY = "AIzaSyA114CSGLYkcVaL3IgaZhtFfi2jdOAe9Mc";
const TOKEN_KEY = "taxright.firebase.idToken";

export async function signIn(email: string, password: string, create = false) {
  const endpoint = create ? "accounts:signUp" : "accounts:signInWithPassword";
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${FIREBASE_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  const body = await response.json() as { idToken?: string; error?: { message?: string } };
  if (!response.ok || !body.idToken) throw new Error(body.error?.message?.replaceAll("_", " ") ?? "Sign-in failed");
  localStorage.setItem(TOKEN_KEY, body.idToken);
}

export function clearSignIn() { localStorage.removeItem(TOKEN_KEY); }

import type { ExtractionRequestType, TaxDocumentExtraction } from "./extraction";

export async function requestDocumentExtraction(file: File, requestedType: ExtractionRequestType): Promise<TaxDocumentExtraction & { model: string }> {
  const token = typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Please sign in before uploading tax documents.");
  const form = new FormData();
  form.set("file", file);
  form.set("requestedType", requestedType);
  form.set("processingConsent", "true");
  let response: Response;
  try {
    response = await fetch("/api/documents/extract", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form, signal: AbortSignal.timeout(45_000) });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") throw new Error("Document extraction timed out after 45 seconds. Please retry with the original PDF or a clearer scan.");
    throw error;
  }
  const body = await response.json() as { extraction?: TaxDocumentExtraction & { model: string }; error?: { message?: string } };
  if (response.status === 401) throw new Error("Please sign in before extracting tax documents.");
  if (!response.ok || !body.extraction) throw new Error(body.error?.message ?? "Document extraction failed");
  return body.extraction;
}
