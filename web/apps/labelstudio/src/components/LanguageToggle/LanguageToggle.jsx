import { useCallback, useMemo } from "react";
import { Button } from "@humansignal/ui";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/bem";
import { changeLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@humansignal/core/lib/i18n";
import "./LanguageToggle.scss";

const normalise = (lng) => lng?.split?.("-")?.[0] ?? DEFAULT_LANGUAGE;

const LANGUAGE_KEYS = Object.freeze({
  en: "language.english",
  zh: "language.chinese",
});

export const LanguageToggle = () => {
  const { i18n, t } = useTranslation();
  const languageToggleClass = useMemo(() => cn("language-toggle"), []);

  const current = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((item) => item.code === normalise(i18n.language)) ?? SUPPORTED_LANGUAGES[0];
  }, [i18n.language]);

  const getLanguageLabel = useCallback(
    (language) => {
      if (!language) return "";

      const key = LANGUAGE_KEYS[language.code];
      return key ? t(key, { defaultValue: language.label }) : language.label;
    },
    [t],
  );

  const handleSelect = useCallback(
    async (code) => {
      if (!code || code === current.code) return;

      await changeLanguage(code);
    },
    [current.code],
  );
  window.changeLanguage = handleSelect;

  const visibleLanguages = useMemo(() => {
    const preferredOrder = ["en", "zh"];
    const prioritized = preferredOrder
      .map((code) => SUPPORTED_LANGUAGES.find((language) => language.code === code))
      .filter(Boolean);

    // Fallback: show all supported languages if preferred ones are missing
    return prioritized.length > 0 ? prioritized : SUPPORTED_LANGUAGES;
  }, []);

  return (
    <fieldset className={languageToggleClass.toString()}>
      <legend className={languageToggleClass.elem("legend")}>{t("language.toggle")}</legend>

      <div className={languageToggleClass.elem("buttons")}>
        {visibleLanguages.map((language) => {
          const isActive = language.code === current.code;
          const label = getLanguageLabel(language);

          return (
            <Button
              key={language.code}
              className={languageToggleClass.elem("switch-button")}
              variant="neutral"
              look="ghost"
              size="small"
              type="button"
              data-active={isActive}
              aria-pressed={isActive}
              onClick={() => handleSelect(language.code)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
};
