import { z } from "zod";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";
import { IconCloudProviderS3 } from "@humansignal/icons";
import i18n from "@humansignal/core/lib/i18n";

const t = (key: string) => i18n.t(`settings.storage.providers.s3.${key}`);
const tc = (key: string) => i18n.t(`settings.storage.common.${key}`);

export const s3Provider: ProviderConfig = {
  name: "s3",
  title: t("title"),
  description: t("description"),
  icon: IconCloudProviderS3,
  fields: [
    {
      name: "bucket",
      type: "text",
      label: t("fields.bucket.label"),
      required: true,
      placeholder: t("fields.bucket.placeholder"),
      schema: z.string().min(1, t("fields.bucket.errors.required")),
    },
    {
      name: "region_name",
      type: "text",
      label: t("fields.region_name.label"),
      placeholder: t("fields.region_name.placeholder"),
      schema: z.string().optional().default(""),
    },
    {
      name: "s3_endpoint",
      type: "text",
      label: t("fields.s3_endpoint.label"),
      placeholder: t("fields.s3_endpoint.placeholder"),
      schema: z.string().optional().default(""),
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
      name: "aws_access_key_id",
      type: "password",
      label: t("fields.aws_access_key_id.label"),
      required: true,
      placeholder: t("fields.aws_access_key_id.placeholder"),
      autoComplete: "off",
      accessKey: true,
      schema: z.string().min(1, t("fields.aws_access_key_id.errors.required")),
    },
    {
      name: "aws_secret_access_key",
      type: "password",
      label: t("fields.aws_secret_access_key.label"),
      required: true,
      placeholder: t("fields.aws_secret_access_key.placeholder"),
      autoComplete: "new-password",
      accessKey: true,
      schema: z.string().min(1, t("fields.aws_secret_access_key.errors.required")),
    },
    {
      name: "aws_session_token",
      type: "password",
      label: t("fields.aws_session_token.label"),
      placeholder: t("fields.aws_session_token.placeholder"),
      autoComplete: "new-password",
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
    { fields: ["region_name"] },
    { fields: ["s3_endpoint"] },
    { fields: ["prefix"] },
    { fields: ["aws_access_key_id"] },
    { fields: ["aws_secret_access_key"] },
    { fields: ["aws_session_token"] },
    { fields: ["presign", "presign_ttl"] },
  ],
};

export default s3Provider;
