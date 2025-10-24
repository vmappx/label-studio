import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderGCS } from "@humansignal/icons";
import i18n from "@humansignal/core/lib/i18n";

const t = (key: string) => i18n.t(`settings.storage.providers.gcs.${key}`);
const tc = (key: string) => i18n.t(`settings.storage.common.${key}`);

export const gcsProvider: ProviderConfig = {
  name: "gcs",
  title: t("title"),
  description: t("description"),
  icon: IconCloudProviderGCS,
  fields: [
    {
      name: "bucket",
      type: "text",
      label: t("fields.bucket.label"),
      required: true,
      schema: z.string().min(1, t("fields.bucket.errors.required")),
    },
    {
      name: "prefix",
      type: "text",
      label: tc("prefix.label"),
      placeholder: tc("prefix.placeholder"),
      schema: z.string().optional().default(""),
      target: "export",
    },
    {
      name: "google_application_credentials",
      type: "password",
      label: t("fields.google_application_credentials.label"),
      description: t("fields.google_application_credentials.description"),
      autoComplete: "new-password",
      accessKey: true,
      schema: z.string().optional().default(""), // JSON validation could be added if needed
    },
    {
      name: "google_project_id",
      type: "text",
      label: t("fields.google_project_id.label"),
      description: t("fields.google_project_id.description"),
      schema: z.string().optional().default(""),
    },
    {
      name: "presign",
      type: "toggle",
      label: tc("presign.label"),
      description: tc("presign.description"),
      schema: z.boolean().default(true),
      target: "import",
      resetConnection: false,
    },
    {
      name: "presign_ttl",
      type: "counter",
      label: tc("presign_ttl.label"),
      min: 1,
      max: 10080,
      step: 1,
      schema: z.number().min(1).max(10080).default(15),
      target: "import",
      resetConnection: false,
      dependsOn: {
        field: "presign",
        value: true,
      },
    },
  ],
  layout: [
    { fields: ["bucket"] },
    { fields: ["prefix"] },
    { fields: ["google_application_credentials"] },
    { fields: ["google_project_id"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};

export default gcsProvider;
