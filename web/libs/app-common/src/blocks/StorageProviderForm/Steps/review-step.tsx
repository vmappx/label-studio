import { useTranslation } from "react-i18next";

interface ReviewStepProps {
  formData: any;
  filesPreview?: any;
  formatSize?: (bytes: number) => string;
}

export const ReviewStep = ({ formData, filesPreview, formatSize }: ReviewStepProps) => {
  const { t } = useTranslation();
  const getProviderDisplayName = (provider: string) => {
    const providerMap: Record<string, string> = {
      s3: t("settings.storage.providers.s3.title"),
      s3s: t("settings.storage.providers.s3s.title"),
      gcs: t("settings.storage.providers.gcs.title"),
      gcswif: t("settings.storage.providers.gcsWif.title"),
      azure: t("settings.storage.providers.azure.title"),
      azure_spi: t("settings.storage.providers.azureSpi.title"),
      redis: t("settings.storage.providers.redis.title"),
      databricks: t("settings.storage.providers.databricks.title"),
      localfiles: t("settings.storage.providers.localfiles.title"),
    };
    return providerMap[provider] || provider;
  };

  const getBucketName = () => {
    return formData.bucket || formData.container || t("settings.storage.review.notSpecified");
  };

  const getFileCount = () => {
    if (!filesPreview) return t("settings.storage.review.files.count", { count: 0 });

    // Check if the last file is the "preview limit reached" indicator
    const lastFile = filesPreview[filesPreview.length - 1];
    const hasMoreFiles = lastFile && lastFile.key === null;

    if (hasMoreFiles) {
      // Subtract 1 to exclude the placeholder file
      const visibleFileCount = filesPreview.length - 1;
      return t("settings.storage.review.files.moreThan", { count: visibleFileCount });
    }

    return t("settings.storage.review.files.count", { count: filesPreview.length });
  };

  const getTotalSize = () => {
    if (!filesPreview || !formatSize) return t("settings.storage.review.size.none");

    // Check if the last file is the "preview limit reached" indicator
    const lastFile = filesPreview[filesPreview.length - 1];
    const hasMoreFiles = lastFile && lastFile.key === null;

    // Calculate total size excluding the placeholder file if it exists
    const filesToCount = hasMoreFiles ? filesPreview.slice(0, -1) : filesPreview;
    const totalBytes = filesToCount.reduce((sum: number, file: any) => sum + (file.size || 0), 0);

    if (hasMoreFiles) {
      return t("settings.storage.review.size.moreThan", { size: formatSize(totalBytes) });
    }

    return formatSize(totalBytes);
  };

  return (
    <div>
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t("settings.storage.review.title")}</h2>
        <p className="text-gray-600 mt-1">{t("settings.storage.review.description")}</p>
      </div>

      {/* Connection Details Section */}
      <div className="grid grid-cols-2 gap-y-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">{t("settings.storage.review.provider")}</p>
          <p className="font-medium">{getProviderDisplayName(formData.provider)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">{t("settings.storage.review.location")}</p>
          <p className="font-medium">{getBucketName()}</p>
        </div>

        {formData.prefix && (
          <div>
            <p className="text-sm text-gray-500">{t("settings.storage.review.prefix")}</p>
            <p className="font-medium">{formData.prefix}</p>
          </div>
        )}

        {filesPreview && (
          <>
            <div>
              <p className="text-sm text-gray-500">{t("settings.storage.review.files.title")}</p>
              <p className="font-medium">{getFileCount()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">{t("settings.storage.review.size.title")}</p>
              <p className="font-medium">{getTotalSize()}</p>
            </div>
          </>
        )}
      </div>

      {/* Import Process Section */}
      <div className="bg-primary-background border border-primary-border-subtler rounded-small p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">{t("settings.storage.review.process.title")}</h3>
        <p>{t("settings.storage.review.process.description")}</p>
      </div>
    </div>
  );
};
