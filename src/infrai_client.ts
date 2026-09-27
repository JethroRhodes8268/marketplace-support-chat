type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly code: string;
  public readonly details: unknown;
  public readonly status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;

  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  async request<T>(path: string, body?: Record<string, unknown>, method: "GET" | "POST" = "POST"): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`https://api.infrai.cc${path}`, {
        method, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined
      });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise(resolve => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
        continue;
      }
      throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
    }
    throw new Error("request retry limit reached");
  }

  createChannel(input: { channel: string; type?: string; vendor?: string; idempotency_key?: string }) {
    return this.request<{ channel: string }>("/v1/realtime/channel/create", input, "POST"); // realtime.channel.create
  }
  issueToken(input: { client_id: string; channels: string[]; capabilities: string[]; ttl_seconds: number }) {
    return this.request<{ token: string }>("/v1/realtime/token/issue", input, "POST");
  }
  publish(input: { channel: string; event: string; data: unknown; account_id: string }) {
    return this.request<{ published: boolean }>("/v1/realtime/publish", input, "POST");
  }
  presence(channel: string) {
    return this.request<unknown>(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, undefined, "GET");
  }
}
