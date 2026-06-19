import type { CapsuleSession } from "@/lib/types";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
}

export async function uploadCapsuleSession(input: {
  blob: Blob;
  durationSec: number;
  title: string;
  transcript?: string;
  vapiSessionId?: string;
}) {
  const formData = new FormData();
  formData.append("video", input.blob, "capsule-session.webm");
  formData.append("durationSec", String(input.durationSec));
  formData.append("title", input.title);

  if (input.transcript) {
    formData.append("transcript", input.transcript);
  }

  if (input.vapiSessionId) {
    formData.append("vapiSessionId", input.vapiSessionId);
  }

  const response = await fetch(`${getApiBaseUrl()}/sessions/end`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return (await response.json()) as CapsuleSession;
}
