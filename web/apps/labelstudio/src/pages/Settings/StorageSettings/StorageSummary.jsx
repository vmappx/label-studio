import { format } from "date-fns/esm";
import { Button, CodeBlock, IconFileCopy, Space, Tooltip } from "@humansignal/ui";
import { DescriptionList } from "../../../components/DescriptionList/DescriptionList";
import { modal } from "../../../components/Modal/Modal";
import { Oneof } from "../../../components/Oneof/Oneof";
import { getLastTraceback } from "../../../utils/helpers";
import { useCopyText } from "@humansignal/core";
import { useTranslation, Trans } from "react-i18next";

const StorageDocsLink = ({ children, ariaLabel }) => {
  return (
    <a
      href="https://labelstud.io/guide/storage.html#Troubleshooting"
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
};

const CopyButton = ({ msg }) => {
  const [copyText, copied] = useCopyText({ defaultText: msg });
  const { t } = useTranslation();

  return (
    <Button variant="neutral" icon={<IconFileCopy />} onClick={() => copyText()} disabled={copied} className="w-[7rem]">
      {copied ? t("settings.storage.summary.copySuccess") : t("settings.storage.summary.copy")}
    </Button>
  );
};

export const StorageSummary = ({ target, storage, className, storageTypes = [] }) => {
  const { t } = useTranslation();
  const storageStatusLabel = storage.status?.replace(/_/g, " ").replace(/(^\w)/, (match) => match.toUpperCase()) ?? "";
  const statusKey = storage.status?.toLowerCase?.() ?? "";
  const statusLabel = t(`settings.storage.summary.status.values.${statusKey}`, {
    defaultValue: storageStatusLabel,
  });
  const lastSyncCount = storage.last_sync_count ?? 0;
  const tasksAlreadySynced = storage.meta?.tasks_existed ?? 0;
  const totalAnnotations = storage.meta?.total_annotations ?? 0;

  const tasksAddedHelp = t("settings.storage.summary.tasks.added", { count: lastSyncCount });
  const tasksTotalHelp = t("settings.storage.summary.tasks.total", {
    existing: tasksAlreadySynced,
    total: tasksAlreadySynced + lastSyncCount,
  });
  const annotationsAddedHelp = t("settings.storage.summary.annotations.added", { count: lastSyncCount });
  const annotationsTotalHelp =
    typeof storage.meta?.total_annotations !== "undefined"
      ? t("settings.storage.summary.annotations.total", { total: totalAnnotations })
      : "";

  const statusHelpLines = t("settings.storage.summary.status.help", { returnObjects: true });
  const statusHelpText = Array.isArray(statusHelpLines) ? statusHelpLines.join("\n") : statusHelpLines;
  const tasksHelpText = [tasksAddedHelp, tasksTotalHelp].filter(Boolean).join("\n");
  const annotationsHelpText = [annotationsAddedHelp, annotationsTotalHelp].filter(Boolean).join("\n");

  const handleButtonClick = () => {
    const msg =
      `Error logs for ${target === "export" ? "export " : ""}${storage.type} ` +
      `storage ${storage.id} in project ${storage.project} and job ${storage.last_sync_job}:\n\n` +
      `${getLastTraceback(storage.traceback)}\n\n` +
      `meta = ${JSON.stringify(storage.meta)}\n`;

    const currentModal = modal({
      title: t("settings.storage.summary.logs.title"),
      body: <CodeBlock code={msg} variant="negative" className="max-h-[50vh] overflow-y-auto" />,
      footer: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {!window.APP_SETTINGS?.whitelabel_is_active && (
            <div>
              <Trans
                i18nKey="settings.storage.summary.logs.documentation"
                components={{
                  link: <StorageDocsLink ariaLabel={t("settings.storage.summary.logs.docsAria")} />,
                }}
              />
            </div>
          )}
          <Space>
            <CopyButton msg={msg} />
            <Button variant="primary" className="w-[7rem]" onClick={() => currentModal.close()}>
              {t("settings.storage.summary.logs.close")}
            </Button>
          </Space>
        </div>
      ),
      style: { width: "700px" },
      optimize: false,
      allowClose: true,
    });
  };

  return (
    <div className={className}>
      <DescriptionList>
        <DescriptionList.Item term={t("settings.storage.summary.fields.type")}>
          {(storageTypes ?? []).find((s) => s.name === storage.type)?.title ?? storage.type}
        </DescriptionList.Item>

        <Oneof value={storage.type}>
          <SummaryS3 case={["s3", "s3s"]} storage={storage} t={t} />
          <GCSStorage case="gcs" storage={storage} t={t} />
          <AzureStorage case="azure" storage={storage} t={t} />
          <RedisStorage case="redis" storage={storage} t={t} />
          <LocalStorage case="localfiles" storage={storage} t={t} />
        </Oneof>

        <DescriptionList.Item term={t("settings.storage.summary.fields.status")} help={statusHelpText}>
          {storage.status === "failed" || storage.status === "completed_with_errors" ? (
            <span
              className="cursor-pointer border-b border-dashed border-negative-border-subtle text-negative-content"
              onClick={handleButtonClick}
            >
              {statusLabel} ({t("settings.storage.summary.logs.view")})
            </span>
          ) : (
            statusLabel
          )}
        </DescriptionList.Item>

        {target === "export" ? (
          <DescriptionList.Item term={t("settings.storage.summary.fields.annotations")} help={annotationsHelpText}>
            <Tooltip title={annotationsAddedHelp}>
              <span>{lastSyncCount}</span>
            </Tooltip>
            <Tooltip title={annotationsTotalHelp}>
              <span> ({t("settings.storage.summary.annotations.totalLabel", { total: totalAnnotations })})</span>
            </Tooltip>
          </DescriptionList.Item>
        ) : (
          <DescriptionList.Item term={t("settings.storage.summary.fields.tasks")} help={tasksHelpText}>
            <Tooltip title={tasksHelpText} style={{ whiteSpace: "pre-wrap" }}>
              <span>{lastSyncCount + tasksAlreadySynced}</span>
            </Tooltip>
            <Tooltip title={tasksAddedHelp}>
              <span> ({t("settings.storage.summary.tasks.addedLabel", { count: lastSyncCount })})</span>
            </Tooltip>
          </DescriptionList.Item>
        )}

        <DescriptionList.Item term={t("settings.storage.summary.fields.lastSync")}>
          {storage.last_sync
            ? format(new Date(storage.last_sync), "MMMM dd, yyyy ∙ HH:mm:ss")
            : t("settings.storage.summary.notSynced")}
        </DescriptionList.Item>
      </DescriptionList>
    </div>
  );
};

const SummaryS3 = ({ storage, t }) => {
  return (
    <DescriptionList.Item term={t("settings.storage.summary.fields.bucket")}>{storage.bucket}</DescriptionList.Item>
  );
};

const GCSStorage = ({ storage, t }) => {
  return (
    <DescriptionList.Item term={t("settings.storage.summary.fields.bucket")}>{storage.bucket}</DescriptionList.Item>
  );
};

const AzureStorage = ({ storage, t }) => {
  return (
    <DescriptionList.Item term={t("settings.storage.summary.fields.container")}>
      {storage.container}
    </DescriptionList.Item>
  );
};

const RedisStorage = ({ storage, t }) => {
  return (
    <>
      <DescriptionList.Item term={t("settings.storage.summary.fields.path")}>{storage.path}</DescriptionList.Item>
      <DescriptionList.Item term={t("settings.storage.summary.fields.host")}>
        {storage.host}
        {storage.port ? `:${storage.port}` : ""}
      </DescriptionList.Item>
    </>
  );
};

const LocalStorage = ({ storage, t }) => {
  return <DescriptionList.Item term={t("settings.storage.summary.fields.path")}>{storage.path}</DescriptionList.Item>;
};
