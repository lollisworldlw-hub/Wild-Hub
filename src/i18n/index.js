// Translation for text that isn't in the T table in App.jsx.
// tr("English text") returns the text in the current language, or the English when there's no translation.
// Use {name} placeholders for values: tr("{n} members", { n: 5 }).
import DE from "./de.js";
import IT from "./it.js";
import FR from "./fr.js";
import SV from "./sv.js";
import TR from "./tr.js";

const DICTS = { de: DE, it: IT, fr: FR, sv: SV, tr: TR };
const LOCALES = { en: "en-US", de: "de-DE", fr: "fr-FR", it: "it-IT", sv: "sv-SE", tr: "tr-TR" };

let current = "en";

// Called by App on every render, before the pages render, so every tr() call sees the chosen language
export const setI18nLang = (lang) => { current = lang || "en"; };
export const getI18nLang = () => current;

export const tr = (text, vars) => {
  let out = DICTS[current]?.[text] ?? text;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return out;
};

// Locale for dates and numbers, e.g. "Oct 8" in English, "8. Okt." in German
export const dateLocale = () => LOCALES[current] || "en-US";
