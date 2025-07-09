const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const originalFetch = global.fetch;

global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (typeof input === "string" && input.startsWith("/")) {
    input = `${API_BASE}${input}`;
  }
  return originalFetch(input, init);
};
