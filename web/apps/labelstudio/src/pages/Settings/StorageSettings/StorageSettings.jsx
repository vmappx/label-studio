import { Typography } from "@humansignal/ui";
import { useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { useProject } from "../../../providers/ProjectProvider";
import { cn } from "../../../utils/bem";
import { isInLicense, LF_CLOUD_STORAGE_FOR_MANAGERS } from "../../../utils/license-flags";
import { StorageSet } from "./StorageSet";
import { useTranslation } from "react-i18next";
import i18n from "@humansignal/core/lib/i18n";

const isAllowCloudStorage = !isInLicense(LF_CLOUD_STORAGE_FOR_MANAGERS);

export const StorageSettings = () => {
  const { project } = useProject();
  const rootClass = cn("storage-settings"); // TODO: Remove in the next BEM cleanup
  const history = useHistory();
  const location = useLocation();
  const sourceStorageRef = useRef();
  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("settings.storage.pageTitle")]));

  // Handle auto-open query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("open") === "source") {
      // Auto-trigger "Add Source Storage" modal
      setTimeout(() => {
        sourceStorageRef.current?.openAddModal();
      }, 100); // Small delay to ensure component is mounted

      // Clean URL by removing the query parameter
      history.replace(location.pathname);
    }
  }, [location, history]);

  return isAllowCloudStorage ? (
    <section className="max-w-[680px]">
      <Typography variant="headline" size="medium" className="mb-base">
        {t("settings.storage.title")}
      </Typography>
      <Typography size="small" className="text-neutral-content-subtler mb-wider">
        {t("settings.storage.description")}
      </Typography>

      <div className="grid grid-cols-2 gap-8">
        <StorageSet
          ref={sourceStorageRef}
          title={t("settings.storage.source.title")}
          buttonLabel={t("settings.storage.source.button")}
          rootClass={rootClass}
        />

        <StorageSet
          title={t("settings.storage.target.title")}
          target="export"
          buttonLabel={t("settings.storage.target.button")}
          rootClass={rootClass}
        />
      </div>
    </section>
  ) : null;
};

StorageSettings.title = () => i18n.t("settings.menu.storage");
StorageSettings.path = "/storage";
