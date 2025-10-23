import type { PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { initI18n } from "../lib/i18n";

initI18n();

export const I18nProvider = ({ children }: PropsWithChildren<unknown>) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
