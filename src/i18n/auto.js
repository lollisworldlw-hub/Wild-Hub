// Auto-translation for text people type into the app (battle plans, train goals).
// Calls the "translate" Supabase Edge Function (DeepL). Results are kept in memory and in
// localStorage, so each text is only fetched once per device and language.
import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";
import { getI18nLang } from "./index.js";

const STORE_KEY = "wild_auto_tr";
const STORE_MAX = 800; // entries kept on the device

const cache = (() => {
  try { return new Map(JSON.parse(localStorage.getItem(STORE_KEY)) || []); } catch { return new Map(); }
})();
const persist = () => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...cache].slice(-STORE_MAX))); } catch {}
};

const listeners = new Set();
const inFlight = new Set();
let queue = new Map(); // lang → Set of texts waiting to be sent
let timer = null;

const keyFor = (lang, text) => `${lang}\n${text}`;

// Batch everything asked for in the same moment into one request per language
const flush = async () => {
  timer = null;
  const batch = queue;
  queue = new Map();
  for (const [lang, set] of batch) {
    const texts = [...set];
    for (let i = 0; i < texts.length; i += 50) {
      const chunk = texts.slice(i, i + 50);
      try {
        const { data, error } = await supabase.functions.invoke("translate", { body: { texts: chunk, lang } });
        if (!error && Array.isArray(data?.translations)) {
          chunk.forEach((t, j) => { if (data.translations[j]) cache.set(keyFor(lang, t), data.translations[j]); });
          persist();
        }
      } catch {}
      chunk.forEach(t => inFlight.delete(keyFor(lang, t)));
    }
  }
  listeners.forEach(fn => fn());
};

const request = (lang, text) => {
  const k = keyFor(lang, text);
  if (cache.has(k) || inFlight.has(k)) return;
  inFlight.add(k);
  if (!queue.has(lang)) queue.set(lang, new Set());
  queue.get(lang).add(text);
  if (!timer) timer = setTimeout(flush, 60);
};

// texts → the same texts in the current language (the original shows until the translation arrives)
export function useAutoTranslate(texts) {
  const lang = getI18nLang();
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump(n => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  const list = texts.map(t => String(t ?? ""));
  useEffect(() => {
    list.forEach(t => { if (t.trim()) request(lang, t); });
  }, [lang, list.join("\u0000")]);
  return list.map(t => cache.get(keyFor(lang, t)) ?? t);
}
