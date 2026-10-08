// Translates text people type into the app (battle plans, train goals) with DeepL.
// Each translation is saved in the "translations" table, so a text is only sent to DeepL once per language.
// Needs the DEEPL_API_KEY secret (Supabase → Edge Functions → Secrets).
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
// App language → DeepL target language
const TARGETS: Record<string, string> = { en: "EN-US", de: "DE", fr: "FR", it: "IT", sv: "SV", tr: "TR" };
const MAX_TEXTS = 100;
const MAX_CHARS = 20000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const sha256 = async (s: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { texts?: unknown; lang?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
  const lang = String(body.lang || "");
  const target = TARGETS[lang];
  const texts = Array.isArray(body.texts) ? body.texts.map((t) => String(t ?? "")) : null;
  if (!target || !texts) return json({ error: "Send { texts: string[], lang }" }, 400);
  if (texts.length > MAX_TEXTS || texts.reduce((n, t) => n + t.length, 0) > MAX_CHARS) return json({ error: "Too much text" }, 413);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const keys = await Promise.all(texts.map((t) => sha256(`${lang}\n${t}`)));
  const out: string[] = texts.slice();

  // Saved translations first
  const { data: saved } = await db.from("translations").select("key, translated").in("key", [...new Set(keys)]);
  const savedMap = new Map((saved || []).map((r) => [r.key, r.translated]));
  const missing: number[] = [];
  texts.forEach((t, i) => {
    if (!t.trim()) return;
    if (savedMap.has(keys[i])) out[i] = savedMap.get(keys[i]);
    else missing.push(i);
  });

  // Everything else goes to DeepL in one request
  const apiKey = Deno.env.get("DEEPL_API_KEY");
  if (missing.length && apiKey) {
    const uniq = [...new Set(missing.map((i) => texts[i]))];
    const host = apiKey.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
    const res = await fetch(`https://${host}/v2/translate`, {
      method: "POST",
      headers: { "Authorization": `DeepL-Auth-Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: uniq, target_lang: target, preserve_formatting: true }),
    });
    if (!res.ok) return json({ translations: out, error: `DeepL ${res.status}` });
    const { translations } = await res.json();
    const byText = new Map(uniq.map((t, j) => [t, translations?.[j]?.text ?? t]));
    missing.forEach((i) => { out[i] = byText.get(texts[i]) ?? texts[i]; });
    const rows = uniq.map((t) => ({ key: keys[texts.indexOf(t)], lang, source: t, translated: byText.get(t) }));
    await db.from("translations").upsert(rows, { onConflict: "key" });
  }

  return json({ translations: out, ...(missing.length && !apiKey ? { error: "DEEPL_API_KEY not set" } : {}) });
});
