import Vapi from "@vapi-ai/web";

export function getVapiConfig() {
  return {
    publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "",
    assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? ""
  };
}

export function createVapiClient() {
  const { publicKey } = getVapiConfig();

  if (!publicKey) {
    throw new Error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
  }

  return new Vapi(publicKey);
}
