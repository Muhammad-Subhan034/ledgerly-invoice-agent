const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = process.env.HF_CHAT_MODEL || "meta-llama/Llama-3.1-8B-Instruct:novita";
const DEFAULT_VISION_MODEL = process.env.HF_VISION_MODEL || "Qwen/Qwen2.5-VL-72B-Instruct";

export async function hfChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: { maxTokens?: number; temperature?: number; model?: string } = {}
): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(HF_ROUTER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: opts.model || DEFAULT_MODEL,
        messages,
        max_tokens: opts.maxTokens ?? 400,
        temperature: opts.temperature ?? 0.2,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.error("HF router error", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("HF router call failed", err);
    return null;
  }
}

export async function hfVisionChat(
  base64Image: string,
  mimeType: string,
  prompt: string,
  opts: { model?: string; maxTokens?: number } = {}
): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(HF_ROUTER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: opts.model || DEFAULT_VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        max_tokens: opts.maxTokens ?? 800,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      console.error("HF vision router error", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("HF vision router call failed", err);
    return null;
  }
}
