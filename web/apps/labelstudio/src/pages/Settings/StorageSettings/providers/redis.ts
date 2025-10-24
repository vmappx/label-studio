import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderRedis } from "@humansignal/icons";
import i18n from "@humansignal/core/lib/i18n";

const t = (key: string) => i18n.t(`settings.storage.providers.redis.${key}`);
const tc = (key: string) => i18n.t(`settings.storage.common.${key}`);

export const redisProvider: ProviderConfig = {
  name: "redis",
  title: t("title"),
  description: t("description"),
  icon: IconCloudProviderRedis,
  fields: [
    {
      name: "db",
      type: "text",
      label: t("fields.db.label"),
      placeholder: t("fields.db.placeholder"),
      schema: z.string().default("1"),
    },
    {
      name: "password",
      type: "password",
      label: t("fields.password.label"),
      autoComplete: "new-password",
      placeholder: t("fields.password.placeholder"),
      schema: z.string().optional().default(""),
    },
    {
      name: "host",
      type: "text",
      label: t("fields.host.label"),
      required: true,
      placeholder: t("fields.host.placeholder"),
      schema: z.string().min(1, t("fields.host.errors.required")),
    },
    {
      name: "port",
      type: "text",
      label: t("fields.port.label"),
      placeholder: t("fields.port.placeholder"),
      schema: z.string().default("6379"),
    },
    {
      name: "prefix",
      type: "text",
      label: tc("prefix.label"),
      placeholder: tc("prefix.placeholder"),
      schema: z.string().optional().default(""),
      target: "export",
    },
  ],
  layout: [{ fields: ["host", "port", "db", "password"] }, { fields: ["prefix"] }],
};

export default redisProvider;
