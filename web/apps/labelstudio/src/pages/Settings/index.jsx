import { SidebarMenu } from "../../components/SidebarMenu/SidebarMenu";
import { WebhookPage } from "../WebhookPage/WebhookPage";
import { useTranslation } from "react-i18next";
import i18n from "@humansignal/core/lib/i18n";
import { DangerZone } from "./DangerZone";
import { GeneralSettings } from "./GeneralSettings";
import { AnnotationSettings } from "./AnnotationSettings";
import { LabelingSettings } from "./LabelingSettings";
import { MachineLearningSettings } from "./MachineLearningSettings/MachineLearningSettings";
import { PredictionsSettings } from "./PredictionsSettings/PredictionsSettings";
import { StorageSettings } from "./StorageSettings/StorageSettings";
import { isInLicense, LF_CLOUD_STORAGE_FOR_MANAGERS } from "../../utils/license-flags";
import "./settings.scss";

const isAllowCloudStorage = !isInLicense(LF_CLOUD_STORAGE_FOR_MANAGERS);

export const MenuLayout = ({ children, ...routeProps }) => {
  const { t } = useTranslation();

  const menuItems = [
    [GeneralSettings.path, t("settings.menu.general")],
    [LabelingSettings.path, t("settings.menu.labeling")],
    [AnnotationSettings.path, t("settings.menu.annotation")],
    [MachineLearningSettings.path, t("settings.menu.machineLearning")],
    [PredictionsSettings.path, t("settings.menu.predictions")],
    isAllowCloudStorage && [StorageSettings.path, t("settings.menu.storage")],
    [WebhookPage.path ?? "/webhooks", t("settings.menu.webhooks")],
    [DangerZone.path, t("settings.menu.dangerZone")],
  ].filter(Boolean);

  return (
    <SidebarMenu
      menuItems={menuItems}
      path={routeProps.match.url}
      children={children}
    />
  );
};

const pages = {
  AnnotationSettings,
  LabelingSettings,
  MachineLearningSettings,
  PredictionsSettings,
  WebhookPage,
  DangerZone,
};

isAllowCloudStorage && (pages.StorageSettings = StorageSettings);

export const SettingsPage = {
  title: () => i18n.t("settings.pageTitle"),
  path: "/settings",
  exact: true,
  layout: MenuLayout,
  component: GeneralSettings,
  pages,
};
