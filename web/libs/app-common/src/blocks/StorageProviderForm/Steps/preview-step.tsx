import { Label, Toggle, Select, Tooltip, cn } from "@humansignal/ui";
import { Form, Input } from "apps/labelstudio/src/components/Form";
import { IconDocument, IconSearch } from "@humansignal/icons";
import { formatDistanceToNow } from "date-fns";
import { useMemo, type ForwardedRef } from "react";
import { useTranslation } from "react-i18next";

interface PreviewStepProps {
  formData: any;
  formState: any;
  setFormState: (updater: (prevState: any) => any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  action: string;
  target: string;
  type: string;
  project: string;
  storage?: any;
  onSubmit: () => void;
  formRef: ForwardedRef<unknown>;
  filesPreview: any[] | null;
  formatSize: (bytes: number) => string;
  onImportSettingsChange?: () => void;
}

const regexFilters = [
  {
    key: "images",
    regex: ".*.(jpe?g|png|gif)$",
    blob: true,
  },
  {
    key: "videos",
    regex: ".*\\.(mp4|avi|mov|wmv|webm)$",
    blob: true,
  },
  {
    key: "audio",
    regex: ".*\\.(mp3|wav|ogg|flac)$",
    blob: true,
  },
  {
    key: "tabular",
    regex: ".*\\.(csv|tsv)$",
    blob: true,
  },
  {
    key: "json",
    regex: ".*\\.json$",
    blob: false,
  },
  {
    key: "jsonl",
    regex: ".*\\.jsonl$",
    blob: false,
  },
  {
    key: "parquet",
    regex: ".*\\.parquet$",
    blob: false,
  },
  {
    key: "allTasks",
    regex: ".*\\.(json|jsonl|parquet)$",
    blob: false,
  },
] as const;

export const PreviewStep = ({
  formData,
  formState: _formState,
  setFormState,
  handleChange,
  action,
  target,
  type,
  project,
  storage,
  onSubmit,
  formRef,
  filesPreview,
  formatSize,
  onImportSettingsChange,
}: PreviewStepProps) => {
  const { t } = useTranslation();

  const importMethodOptions = useMemo(
    () => [
      {
        value: "Files",
        label: t("settings.storage.preview.importMethod.options.files"),
      },
      {
        value: "Tasks",
        label: t("settings.storage.preview.importMethod.options.tasks"),
      },
    ],
    [t],
  );

  const prefixLabel =
    type === "redis"
      ? t("settings.storage.preview.fields.path.label")
      : t("settings.storage.preview.fields.prefix.label");
  const prefixDescription =
    type === "redis"
      ? t("settings.storage.preview.fields.path.description")
      : t("settings.storage.preview.fields.prefix.description");
  const prefixPlaceholder =
    type === "redis"
      ? t("settings.storage.preview.fields.path.placeholder")
      : t("settings.storage.preview.fields.prefix.placeholder");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("settings.storage.preview.title")}</h2>
        <p className="text-muted-foreground">{t("settings.storage.preview.description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column Header */}
        <h4>{t("settings.storage.preview.sections.configuration")}</h4>

        {/* Right Column Header with Button */}
        <div className="flex justify-between items-center">
          <h4>{t("settings.storage.preview.sections.files")}</h4>
        </div>

        {/* Left Column: Configuration */}
        <div>
          <Form
            ref={formRef}
            action={action}
            params={{ target, type, project, pk: storage?.id }}
            formData={formData}
            skipEmpty={false}
            onSubmit={onSubmit}
            autoFill="off"
            autoComplete="off"
          >
            <div className="space-y-8">
              {/* Path/Bucket Prefix Section - Hide for localfiles since it has its own path field */}
              {type !== "localfiles" && (
                <div className="space-y-2">
                  <Label text={`${prefixLabel} (${t("settings.storage.preview.common.optional")})`} />
                  <p className="text-sm text-muted-foreground">{prefixDescription}</p>
                  <Input
                    id={type === "redis" ? "path" : "prefix"}
                    name={type === "redis" ? "path" : "prefix"}
                    value={type === "redis" ? (formData.path ?? "") : (formData.prefix ?? "")}
                    onChange={(e) => {
                      handleChange(e);
                      // Reset preview when prefix/path changes
                      onImportSettingsChange?.();
                    }}
                    placeholder={prefixPlaceholder}
                    style={{ width: "100%" }}
                    required={false}
                    skip={false}
                    labelProps={{}}
                    ghost={false}
                    tooltipIcon={null}
                  />
                </div>
              )}

              {/* Import Method */}
              <div className="space-y-2">
                <Label
                  text={`${t("settings.storage.preview.importMethod.label")} (${t("settings.storage.preview.common.optional")})`}
                />
                <p className="text-sm text-muted-foreground">
                  {t("settings.storage.preview.importMethod.description")}
                </p>
                <Select
                  name="use_blob_urls"
                  value={formData.use_blob_urls ? "Files" : "Tasks"}
                  onChange={(value) => {
                    const isFiles = value === "Files";
                    setFormState((prevState) => ({
                      ...prevState,
                      formData: {
                        ...prevState.formData,
                        use_blob_urls: isFiles,
                        regex_filter: "", // Reset regex filter when import method changes
                      },
                    }));
                    // Reset validation state when import method changes
                    onImportSettingsChange?.();
                  }}
                  options={importMethodOptions as any}
                  placeholder={t("settings.storage.preview.importMethod.placeholder")}
                />
              </div>

              {/* File Filter Section */}
              <div className="space-y-2">
                <Label
                  text={`${t("settings.storage.preview.fileFilter.label")} (${t("settings.storage.preview.common.optional")})`}
                />
                <p className="text-sm text-muted-foreground">{t("settings.storage.preview.fileFilter.description")}</p>
                <Input
                  id="regex_filter"
                  name="regex_filter"
                  value={formData.regex_filter ?? ""}
                  onChange={(e) => {
                    handleChange(e);
                    // Reset preview when regex filter changes
                    onImportSettingsChange?.();
                  }}
                  placeholder={
                    formData.use_blob_urls
                      ? t("settings.storage.preview.fileFilter.placeholderFiles")
                      : t("settings.storage.preview.fileFilter.placeholderTasks")
                  }
                  style={{ width: "100%" }}
                  label=""
                  description=""
                  footer=""
                  className=""
                  validate=""
                  required={false}
                  skip={false}
                  labelProps={{}}
                  ghost={false}
                  tooltip=""
                  tooltipIcon={null}
                />

                <div className="flex flex-wrap gap-x-2 items-center text-xs">
                  <span className="text-muted-foreground">{t("settings.storage.preview.fileFilter.common")}</span>
                  {regexFilters
                    .filter((r) => r.blob === formData.use_blob_urls)
                    .map((r) => {
                      return (
                        <button
                          key={r.regex}
                          type="button"
                          className="text-blue-600 border-b border-dotted border-blue-400 hover:text-blue-800"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormState((prevState) => ({
                              ...prevState,
                              formData: {
                                ...prevState.formData,
                                regex_filter: r.regex,
                              },
                            }));
                            // Reset preview when common filter is selected
                            onImportSettingsChange?.();
                          }}
                        >
                          {t(`settings.storage.preview.filters.${r.key}`)}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Scan All Subfolders */}
              <div className="flex items-center justify-between">
                <div>
                  <Label text={t("settings.storage.preview.recursive.label")} className="block mb-2" />
                  <p className="text-sm text-muted-foreground">{t("settings.storage.preview.recursive.description")}</p>
                </div>
                <Toggle
                  checked={formData.recursive_scan ?? false}
                  onChange={(e) => {
                    setFormState((prevState) => ({
                      ...prevState,
                      formData: {
                        ...prevState.formData,
                        recursive_scan: e.target.checked,
                      },
                    }));
                    // Reset validation state when recursive scan changes
                    onImportSettingsChange?.();
                  }}
                />
              </div>
            </div>
          </Form>
        </div>

        {/* Right Column: Preview Files */}
        <div className="border rounded-md overflow-hidden h-[340px]">
          <div className="bg-card h-full flex flex-col">
            {filesPreview === null ? (
              // No API response yet
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center flex-grow">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <IconDocument className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">{t("settings.storage.preview.empty.title")}</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t("settings.storage.preview.empty.description")}
                </p>
              </div>
            ) : filesPreview.length === 0 ? (
              // API returned empty array
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center flex-grow">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <IconSearch className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">{t("settings.storage.preview.empty.noFilesTitle")}</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t("settings.storage.preview.empty.noFilesDescription")}
                </p>
              </div>
            ) : (
              // Files available - display in a table format with fixed height and scrolling
              <div className="px-2 py-2 flex-grow overflow-auto">
                <div className="grid grid-cols-1 text-xs gap-1">
                  {filesPreview.map((file, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex justify-between py-0.5 px-2 bg-neutral-surface border-b last:border-b-0 rounded-small",
                        {
                          "hover:bg-neutral-surface-hover": file.key !== null,
                        },
                      )}
                    >
                      <Tooltip
                        title={file.key || t("settings.storage.preview.tooltip.noKey")}
                        disabled={file.key === null}
                      >
                        <div
                          className={cn("max-w-[260px] overflow-hidden", {
                            "cursor-help": file.key !== null,
                          })}
                        >
                          {file.key ? (
                            file.key.length > 28 ? (
                              <span>
                                {file.key.slice(0, 12)}...{file.key.slice(-13)}
                              </span>
                            ) : (
                              file.key
                            )
                          ) : (
                            <span className="italic">{t("settings.storage.preview.tooltip.limitReached")}</span>
                          )}
                        </div>
                      </Tooltip>
                      <div className="flex items-center space-x-1 text-muted-foreground whitespace-nowrap">
                        <span>
                          {file.last_modified && formatDistanceToNow(new Date(file.last_modified), { addSuffix: true })}
                        </span>
                        <span className="mx-0.5">•</span>
                        <span>{file.size && formatSize(file.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
