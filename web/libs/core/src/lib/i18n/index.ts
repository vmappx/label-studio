import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import zhCommon from "./locales/zh/common.json";

export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "zh", label: "中文", shortLabel: "中文" },
] as const;

const STORAGE_KEY = "label-studio.language";

const resources: Resource = {
  en: {
    translation: enCommon,
  },
  zh: {
    translation: zhCommon,
  },
};

const getStoredLanguage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Cannot access localStorage for language", error);
    return null;
  }
};

const detectBrowserLanguage = (): string | null => {
  if (typeof navigator === "undefined") return null;
  const locales: string[] = [];

  if (navigator.languages?.length) {
    locales.push(...navigator.languages);
  }

  if (navigator.language) {
    locales.push(navigator.language);
  }

  const normalized = locales.map((lng) => lng?.split?.("-")?.[0]).filter(Boolean) as string[];

  return normalized.find((lng) => resources[lng as keyof typeof resources]) ?? null;
};

const resolveInitialLanguage = (): string => {
  return getStoredLanguage() ?? detectBrowserLanguage() ?? DEFAULT_LANGUAGE;
};

export const initI18n = () => {
  if (i18n.isInitialized) return i18n;

  i18n.use(initReactI18next).init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

  return i18n;
};

export const changeLanguage = async (lng: string) => {
  if (!resources[lng as keyof typeof resources]) {
    console.warn(`Unsupported language: ${lng}`);
    return;
  }

  await i18n.changeLanguage(lng);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, lng);
    } catch (error) {
      console.warn("Cannot persist language", error);
    }
  }
};

export const getCurrentLanguage = () => i18n.language ?? DEFAULT_LANGUAGE;

export default i18n;
