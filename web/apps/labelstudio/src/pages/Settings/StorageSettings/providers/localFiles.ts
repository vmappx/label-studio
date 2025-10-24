import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconDocument } from "@humansignal/icons";
import i18n from "@humansignal/core/lib/i18n";

const t = (key: string) => i18n.t(`settings.storage.providers.localfiles.${key}`);
const tc = (key: string) => i18n.t(`settings.storage.common.${key}`);

export const localFilesProvider: ProviderConfig = {
  name: "localfiles",
  title: t("title"),
  description: t("description"),
  icon: IconDocument,
  fields: [
    {
      name: "path",
      type: "text",
      label: t("fields.path.label"),
      required: true,
      placeholder: t("fields.path.placeholder"),
      schema: z.string().min(1, t("fields.path.errors.required")),
    },
    {
      name: "prefix",
      type: "text",
      label: t("fields.prefix.label"),
      placeholder: tc("prefix.placeholder"),
      schema: z.string().optional().default(""),
      target: "export",
    },
  ],
  layout: [{ fields: ["path"] }, { fields: ["prefix"] }],
};

export default localFilesProvider;
