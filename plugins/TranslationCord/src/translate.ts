/**
 * Translation provider module.
 * Sends only the selected message text. No Discord tokens, user IDs, or channel metadata.
 */

export type TranslateResult =
  | { ok: true; text: string; provider: string }
  | { ok: false; error: string };

const TIMEOUT_MS = 12000;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Unofficial Google Translate endpoint (client=gtx). No API key. */
async function viaGoogleGtx(text: string): Promise<string> {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=" +
    encodeURIComponent(text);
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
  const data = await res.json();
  // Response shape: [[["translated","original",...],...], ...]
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Unexpected Google Translate response");
  }
  const parts: string[] = [];
  for (const chunk of data[0]) {
    if (Array.isArray(chunk) && typeof chunk[0] === "string") {
      parts.push(chunk[0]);
    }
  }
  const out = parts.join("").trim();
  if (!out) throw new Error("Empty translation from Google");
  return out;
}

/** MyMemory free tier. */
async function viaMyMemory(text: string): Promise<string> {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=en|fr";
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (typeof out !== "string" || !out.trim()) {
    throw new Error("Empty translation from MyMemory");
  }
  if (/MYMEMORY WARNING/i.test(out) || data?.responseStatus === 429) {
    throw new Error("MyMemory rate limit exceeded");
  }
  return out.trim();
}

/** LibreTranslate-compatible public mirrors (best-effort). */
async function viaLibreMirror(text: string): Promise<string> {
  const endpoints = [
    "https://trans.zillyhuhn.com/translate",
    "https://lt.psf.lt/translate",
  ];
  let lastError = "No LibreTranslate mirror available";
  for (const endpoint of endpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: "fr",
          format: "text",
        }),
      });
      if (!res.ok) {
        lastError = `Libre mirror HTTP ${res.status}`;
        continue;
      }
      const data = await res.json();
      const out = data?.translatedText;
      if (typeof out === "string" && out.trim()) return out.trim();
      lastError = "Empty LibreTranslate response";
    } catch (e: any) {
      lastError = e?.message ?? String(e);
    }
  }
  throw new Error(lastError);
}

/**
 * Translate English text to French.
 * Tries providers in order; returns the first successful result.
 */
export async function translateEnglishToFrench(
  text: string
): Promise<TranslateResult> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) {
    return { ok: false, error: "Message has no text to translate." };
  }

  const providers: Array<{ name: string; fn: (t: string) => Promise<string> }> =
    [
      { name: "google-gtx", fn: viaGoogleGtx },
      { name: "mymemory", fn: viaMyMemory },
      { name: "libre-mirror", fn: viaLibreMirror },
    ];

  const errors: string[] = [];
  for (const p of providers) {
    try {
      const result = await p.fn(trimmed);
      return { ok: true, text: result, provider: p.name };
    } catch (e: any) {
      const msg = e?.name === "AbortError" ? "Request timed out" : e?.message ?? String(e);
      errors.push(`${p.name}: ${msg}`);
    }
  }

  return {
    ok: false,
    error:
      "Translation failed. " +
      (errors.length ? errors.join(" | ") : "Network error."),
  };
}
