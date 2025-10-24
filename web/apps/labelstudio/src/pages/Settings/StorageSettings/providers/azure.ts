import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderAzure } from "@humansignal/icons";
import { z } from "zod";
import i18n from "@humansignal/core/lib/i18n";

const t = (key: string) => i18n.t(`settings.storage.providers.azure.${key}`);
const tc = (key: string) => i18n.t(`settings.storage.common.${key}`);

export const azureProvider: ProviderConfig = {
  name: "azure",
  title: t("title"),
  description: t("description"),
  icon: IconCloudProviderAzure,
  fields: [
    {
      name: "container",
      type: "text",
      label: t("fields.container.label"),
      required: true,
      placeholder: t("fields.container.placeholder"),
      schema: z.string().min(1, t("fields.container.errors.required")),
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
      name: "account_name",
      type: "password",
      label: t("fields.account_name.label"),
      autoComplete: "off",
      accessKey: true,
      placeholder: t("fields.account_name.placeholder"),
      schema: z.string().optional().default(""),
    },
    {
      name: "account_key",
      type: "password",
      label: t("fields.account_key.label"),
      autoComplete: "new-password",
      accessKey: true,
      placeholder: t("fields.account_key.placeholder"),
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
    { fields: ["container"] },
    { fields: ["prefix"] },
    { fields: ["account_name"] },
    { fields: ["account_key"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};

export default azureProvider;
