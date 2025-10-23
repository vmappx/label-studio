import { useCallback, useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button, Typography, Spinner, EmptyState, SimpleCard } from "@humansignal/ui";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { useTranslation, Trans } from "react-i18next";
import { Form, Label, Toggle } from "../../../components/Form";
import { modal } from "../../../components/Modal/Modal";
import { IconModels, IconExternal } from "@humansignal/icons";
import { useAPI } from "../../../providers/ApiProvider";
import { ProjectContext } from "../../../providers/ProjectProvider";
import { MachineLearningList } from "./MachineLearningList";
import { CustomBackendForm } from "./Forms";
import { TestRequest } from "./TestRequest";
import { StartModelTraining } from "./StartModelTraining";
import "./MachineLearningSettings.scss";
import i18n from "@humansignal/core/lib/i18n";

export const MachineLearningSettings = () => {
  const api = useAPI();
  const { project, fetchProject } = useContext(ProjectContext);
  const [backends, setBackends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("settings.machineLearning.pageTitle")]));

  const fetchBackends = useCallback(async () => {
    setLoading(true);
    const models = await api.callApi("mlBackends", {
      params: {
        project: project.id,
        include_static: true,
      },
    });

    if (models) setBackends(models);
    setLoading(false);
    setLoaded(true);
  }, [project, setBackends]);

  const startTrainingModal = useCallback(
    (backend) => {
      const modalProps = {
        title: t("settings.machineLearning.modals.startTraining"),
        style: { width: 760 },
        closeOnClickOutside: true,
        body: <StartModelTraining backend={backend} />,
      };

      modal(modalProps);
    },
    [project, t],
  );

  const showRequestModal = useCallback(
    (backend) => {
      const modalProps = {
        title: t("settings.machineLearning.modals.testRequest"),
        style: { width: 760 },
        closeOnClickOutside: true,
        body: <TestRequest backend={backend} />,
      };

      modal(modalProps);
    },
    [project, t],
  );

  const showMLFormModal = useCallback(
    (backend) => {
      const action = backend ? "updateMLBackend" : "addMLBackend";
      const modalTitle = t(
        backend ? "settings.machineLearning.modals.editModel" : "settings.machineLearning.modals.connectModel",
      );
      const modalProps = {
        title: modalTitle,
        style: { width: 760 },
        closeOnClickOutside: false,
        body: (
          <CustomBackendForm
            action={action}
            backend={backend}
            project={project}
            onSubmit={() => {
              fetchBackends();
              modalRef.close();
            }}
          />
        ),
      };

      const modalRef = modal(modalProps);
    },
    [project, fetchBackends, t],
  );

  useEffect(() => {
    if (project.id) {
      fetchBackends();
    }
  }, [project.id]);

  return (
    <section>
      <div className="w-[42rem]">
        <Typography variant="headline" size="medium" className="mb-base">
          {t("settings.machineLearning.title")}
        </Typography>
        {loading && <Spinner size={32} />}
        {loaded && backends.length === 0 && (
          <SimpleCard title="" className="bg-primary-background border-primary-border-subtler p-base">
            <EmptyState
              size="medium"
              variant="primary"
              icon={<IconModels />}
              title={t("settings.machineLearning.emptyState.title")}
              description={t("settings.machineLearning.emptyState.description")}
              actions={
                <Button
                  variant="primary"
                  look="filled"
                  onClick={() => showMLFormModal()}
                  aria-label={t("settings.machineLearning.emptyState.actionAria")}
                >
                  {t("settings.machineLearning.emptyState.action")}
                </Button>
              }
              footer={
                !window.APP_SETTINGS?.whitelabel_is_active && (
                  <Typography variant="label" size="small" className="text-primary-link">
                    <a
                      href="https://labelstud.io/guide/ml"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="ml-help-link"
                      aria-label={t("settings.machineLearning.emptyState.learnMoreAria")}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      {t("actions.learnMore")}
                      <IconExternal width={16} height={16} />
                    </a>
                  </Typography>
                )
              }
            />
          </SimpleCard>
        )}
        <MachineLearningList
          onEdit={(backend) => showMLFormModal(backend)}
          onTestRequest={(backend) => showRequestModal(backend)}
          onStartTraining={(backend) => startTrainingModal(backend)}
          fetchBackends={fetchBackends}
          backends={backends}
        />

        {backends.length > 0 && (
          <div className="my-wide">
            <Typography size="small" className="text-neutral-content-subtler">
              {t("settings.machineLearning.guidance.intro")}
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-base">
              <Trans i18nKey="settings.machineLearning.guidance.step1" components={{ italic: <i /> }} />
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-tighter">
              {t("settings.machineLearning.guidance.step2")}
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-tighter">
              <Trans
                i18nKey="settings.machineLearning.guidance.step3"
                components={{ italic: <i /> }}
              />
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler mt-base">
              <Trans
                i18nKey="settings.machineLearning.guidance.prelabeling"
                components={{
                  link: <NavLink to="annotation" className="hover:underline" />,
                }}
              />
            </Typography>
          </div>
        )}

        <Form
          action="updateProject"
          formData={{ ...project }}
          params={{ pk: project.id }}
          onSubmit={() => fetchProject()}
        >
          {backends.length > 0 && (
            <div className="p-wide border border-neutral-border rounded-md">
              <Form.Row columnCount={1}>
                <Label text={t("settings.machineLearning.form.configuration")} large />

                <div>
                  <Toggle
                    label={t("settings.machineLearning.form.toggleLabel")}
                    description={t("settings.machineLearning.form.toggleDescription")}
                    name="start_training_on_annotation_update"
                  />
                </div>
              </Form.Row>
            </div>
          )}

          {backends.length > 0 && (
            <Form.Actions>
              <Form.Indicator>
                <span case="success">{t("settings.common.saved")}</span>
              </Form.Indicator>
              <Button
                type="submit"
                look="primary"
                className="w-[120px]"
                aria-label={t("settings.machineLearning.form.saveAria")}
              >
                {t("actions.save")}
              </Button>
            </Form.Actions>
          )}
        </Form>
      </div>
    </section>
  );
};

MachineLearningSettings.title = () => i18n.t("settings.menu.machineLearning");
MachineLearningSettings.path = "/ml";
