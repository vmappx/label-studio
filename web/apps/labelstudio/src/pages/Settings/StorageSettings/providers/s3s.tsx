import { EnterpriseBadge, IconSpark } from "@humansignal/ui";
import { Alert, AlertTitle, AlertDescription } from "@humansignal/shad/components/ui/alert";
import { IconCloudProviderS3 } from "@humansignal/icons";
import i18n from "@humansignal/core/lib/i18n";
import type { ProviderConfig } from "@humansignal/app-common/blocks/StorageProviderForm/types/provider";

const s3sProvider: ProviderConfig = {
  name: "s3s",
  title: i18n.t("settings.storage.providers.s3s.title"),
  description: i18n.t("settings.storage.providers.s3s.description"),
  icon: IconCloudProviderS3,
  disabled: true,
  badge: <EnterpriseBadge />,
  fields: [
    {
      name: "enterprise_info",
      type: "message",
      content: (
        <Alert variant="gradient">
          <IconSpark />
          <AlertTitle>{i18n.t("settings.storage.enterpriseFeature.title")}</AlertTitle>
          <AlertDescription>
            {i18n.t("settings.storage.providers.s3s.enterprise.description")}{" "}
            <a
              href="https://docs.humansignal.com/guide/storage.html#Set-up-an-S3-connection-with-IAM-role-access"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              {i18n.t("actions.learnMore")}
            </a>
          </AlertDescription>
        </Alert>
      ),
    },
  ],
  layout: [{ fields: ["enterprise_info"] }],
};

export default s3sProvider;
