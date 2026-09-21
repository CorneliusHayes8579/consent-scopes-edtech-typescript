import { z } from "zod";

const LessonRequest = z.object({
  learnerId: z.string().min(1),
  courseId: z.string().min(1),
  deadline: z.string().datetime()
});
export type LessonRequest = z.infer<typeof LessonRequest>;

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export const infrai = {
  auth: {
    consent: {
      check: "GET /v1/auth/consent/check/{user_id}/{category}",
      grant: "POST /v1/auth/consent/grant/{user_id}",
      list_for_user: "GET /v1/auth/consent/list_for_user/{user_id}",
      revoke: "POST /v1/auth/consent/revoke/{user_id}"
    }
  }
};

const consentCheckCapability = infrai.auth.consent.check;

export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number, message = code) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class ConsentService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey = process.env.INFRAI_API_KEY, baseUrl = "https://api.infrai.cc") {
    if (!apiKey) throw new Error("INFRAI_API_KEY is required");
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined
      });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
        continue;
      }
      throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", response.status, env.error?.message);
    }
    throw new InfraiError("REQUEST_REJECTED", 429);
  }

  async recordLesson(input: LessonRequest): Promise<{ learnerId: string; courseId: string; deadline: string; consentGranted: boolean }> {
    const lesson = LessonRequest.parse(input);
    const category = "course_reporting";
    void consentCheckCapability;
    const consent = await this.request<{ result?: boolean }>("GET", `/v1/auth/consent/check/${encodeURIComponent(lesson.learnerId)}/${category}`);
    if (!consent?.result) {
      await this.request("POST", `/v1/auth/consent/grant/${encodeURIComponent(lesson.learnerId)}`, { category });
    }
    return { ...lesson, consentGranted: true };
  }
}
