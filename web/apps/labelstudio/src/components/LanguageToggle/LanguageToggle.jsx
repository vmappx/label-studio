import { useCallback, useMemo } from "react";
import { Button } from "@humansignal/ui";
import { IconCheck, IconChevronDown } from "@humansignal/icons";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/bem";
import { changeLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@humansignal/core/lib/i18n";
import { Dropdown } from "../Dropdown/Dropdown";
import { Menu } from "../Menu/Menu";
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
  window.changeLanguage = handleSelect

  const menu = (
    <Menu >
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = language.code === current.code;
        {console.info("language.code", language.code, language.label)}
        return (
          <Menu.Item
            key={language.code}
            onClick={() => handleSelect(language.code)}
            active={isActive}
            className={languageToggleClass.elem("menu-item")}
          >
            <span className={languageToggleClass.elem("option")}>
              <span className={languageToggleClass.elem("option-short")}>{language.label}</span>
            </span>
            {isActive && <IconCheck className={languageToggleClass.elem("option-icon")} />}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
   
      <Dropdown.Trigger align="right" content={menu}>
        <Button
          className={languageToggleClass.elem("button")}
          variant="neutral"
          look="ghost"
          size="small"
          tooltip={t("language.toggle")}
          aria-label={t("language.toggle")}
          aria-haspopup="menu"
          type="button"
          trailing={<IconChevronDown className={languageToggleClass.elem("button-icon")} />}
        >
          <span className={languageToggleClass.elem("button-labels")}>
            <span className={languageToggleClass.elem("button-full")}>{current.label}</span>
          </span>
        </Button>
      </Dropdown.Trigger>
  
  );
};
