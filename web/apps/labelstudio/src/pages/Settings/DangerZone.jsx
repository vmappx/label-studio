import { useMemo, useState } from "react";
import { useHistory } from "react-router";
import { Button, Typography, useToast } from "@humansignal/ui";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { Label } from "../../components/Form";
import { modal } from "../../components/Modal/Modal";
import { useModalControls } from "../../components/Modal/ModalPopup";
import Input from "../../components/Form/Elements/Input/Input";
import { Space } from "../../components/Space/Space";
import { Spinner } from "../../components/Spinner/Spinner";
import { useAPI } from "../../providers/ApiProvider";
import { useProject } from "../../providers/ProjectProvider";
import { cn } from "../../utils/bem";
import { Trans, useTranslation } from "react-i18next";
import i18n from "@humansignal/core/lib/i18n";

export const DangerZone = () => {
  const { project } = useProject();
  const api = useAPI();
  const history = useHistory();
  const toast = useToast();
  const [processing, setProcessing] = useState(null);
  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("settings.dangerZone.title")]));

  const showDangerConfirmation = ({ title, message, requiredWord, buttonText, onConfirm }) => {
    const isDev = process.env.NODE_ENV === "development";

    return modal({
      title,
      width: 600,
      allowClose: false,
      body: () => {
        const ctrl = useModalControls();
        const inputValue = ctrl?.state?.inputValue || "";
        const confirmationLabel = t("settings.dangerZone.confirmation.inputLabel", { word: requiredWord });

        return (
          <div>
            <Typography variant="body" size="medium" className="mb-tight">
              {message}
            </Typography>
            <Input
              label={confirmationLabel}
              value={inputValue}
              onChange={(e) => ctrl?.setState({ inputValue: e.target.value })}
              autoFocus
              data-testid="danger-zone-confirmation-input"
              autoComplete="off"
            />
          </div>
        );
      },
      footer: () => {
        const ctrl = useModalControls();
        const inputValue = (ctrl?.state?.inputValue || "").trim().toLocaleLowerCase();
        const confirmWord = requiredWord.toLocaleLowerCase();
        const isValid = isDev || inputValue === confirmWord;

        return (
          <Space align="end">
            <Button
              variant="neutral"
              look="outline"
              onClick={() => ctrl?.hide()}
              data-testid="danger-zone-cancel-button"
            >
              {t("settings.dangerZone.confirmation.cancel")}
            </Button>
            <Button
              variant="negative"
              disabled={!isValid}
              onClick={async () => {
                await onConfirm();
                ctrl?.hide();
              }}
              data-testid="danger-zone-confirm-button"
            >
              {buttonText}
            </Button>
          </Space>
        );
      },
    });
  };

  const handleOnClick = (type) => () => {
    const actionConfig = {
      reset_cache: {
        title: t("settings.dangerZone.actions.resetCache.title"),
        message: (
          <Trans
            i18nKey="settings.dangerZone.actions.resetCache.message"
            values={{ project: project?.title ?? "" }}
            components={{ strong: <strong /> }}
          />
        ),
        requiredWord: t("settings.dangerZone.actions.resetCache.confirmWord", { defaultValue: "cache" }),
        buttonText: t("settings.dangerZone.actions.resetCache.button"),
      },
      tabs: {
        title: t("settings.dangerZone.actions.tabs.title"),
        message: (
          <Trans
            i18nKey="settings.dangerZone.actions.tabs.message"
            values={{ project: project?.title ?? "" }}
            components={{ strong: <strong /> }}
          />
        ),
        requiredWord: t("settings.dangerZone.actions.tabs.confirmWord", { defaultValue: "tabs" }),
        buttonText: t("settings.dangerZone.actions.tabs.button"),
      },
      project: {
        title: t("settings.dangerZone.actions.project.title"),
        message: (
          <Trans
            i18nKey="settings.dangerZone.actions.project.message"
            values={{ project: project?.title ?? "" }}
            components={{ strong: <strong /> }}
          />
        ),
        requiredWord: t("settings.dangerZone.actions.project.confirmWord", { defaultValue: "delete" }),
        buttonText: t("settings.dangerZone.actions.project.button"),
      },
    };

    const config = actionConfig[type];

    if (!config) {
      return;
    }

    showDangerConfirmation({
      ...config,
      onConfirm: async () => {
        setProcessing(type);
        try {
          if (type === "reset_cache") {
            await api.callApi("projectResetCache", {
              params: {
                pk: project.id,
              },
            });
            toast.show({ message: t("settings.dangerZone.toast.resetCache") });
          } else if (type === "tabs") {
            await api.callApi("deleteTabs", {
              body: {
                project: project.id,
              },
            });
            toast.show({ message: t("settings.dangerZone.toast.tabs") });
          } else if (type === "project") {
            await api.callApi("deleteProject", {
              params: {
                pk: project.id,
              },
            });
            toast.show({ message: t("settings.dangerZone.toast.project") });
            history.replace("/projects");
          }
        } catch (error) {
          toast.show({ message: t("settings.dangerZone.toast.error", { message: error.message }), type: "error" });
        } finally {
          setProcessing(null);
        }
      },
    });
  };

  const buttons = useMemo(
    () => [
      {
        type: "annotations",
        disabled: true, //&& !project.total_annotations_number,
        label: t("settings.dangerZone.actions.annotations.label", {
          count: project.total_annotations_number ?? 0,
        }),
      },
      {
        type: "tasks",
        disabled: true, //&& !project.task_number,
        label: t("settings.dangerZone.actions.tasks.label", {
          count: project.task_number ?? 0,
        }),
      },
      {
        type: "predictions",
        disabled: true, //&& !project.total_predictions_number,
        label: t("settings.dangerZone.actions.predictions.label", {
          count: project.total_predictions_number ?? 0,
        }),
      },
      {
        type: "reset_cache",
        help: t("settings.dangerZone.actions.resetCache.help"),
        label: t("settings.dangerZone.actions.resetCache.button"),
      },
      {
        type: "tabs",
        help: t("settings.dangerZone.actions.tabs.help"),
        label: t("settings.dangerZone.actions.tabs.button"),
      },
      {
        type: "project",
        help: t("settings.dangerZone.actions.project.help"),
        label: t("settings.dangerZone.actions.project.button"),
      },
    ],
    [project, t],
  );

  return (
    <div className={cn("simple-settings")}>
      <Typography variant="headline" size="large" className="mb-tighter">
        {t("settings.dangerZone.title")}
      </Typography>
      <Typography variant="body" size="medium" className="text-neutral-content-subtler !mb-base">
        {t("settings.dangerZone.description")}
      </Typography>

      {project.id ? (
        <div style={{ marginTop: 16 }}>
          {buttons.map((btn) => {
            const waiting = processing === btn.type;
            const disabled = btn.disabled || (processing && !waiting);

            return (
              btn.disabled !== true && (
                <div className={cn("settings-wrapper")} key={btn.type}>
                  <Typography variant="title" size="large">
                    {btn.label}
                  </Typography>
                  {btn.help && <Label description={btn.help} style={{ width: 600, display: "block" }} />}
                  <Button
                    key={btn.type}
                    variant="negative"
                    look="outlined"
                    disabled={disabled}
                    waiting={waiting}
                    onClick={handleOnClick(btn.type)}
                    style={{ marginTop: 16 }}
                  >
                    {btn.label}
                  </Button>
                </div>
              )
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
};

DangerZone.title = () => i18n.t("settings.dangerZone.title");
DangerZone.path = "/danger-zone";
