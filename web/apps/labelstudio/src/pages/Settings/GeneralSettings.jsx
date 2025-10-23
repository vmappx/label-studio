import { Button, EnterpriseBadge, Select, Typography } from "@humansignal/ui";
import { useCallback, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Form, Input, TextArea } from "../../components/Form";
import { RadioGroup } from "../../components/Form/Elements/RadioGroup/RadioGroup";
import { ProjectContext } from "../../providers/ProjectProvider";
import { Block, Elem } from "../../utils/bem";
import { HeidiTips } from "../../components/HeidiTips/HeidiTips";
import { FF_LSDV_E_297, isFF } from "../../utils/feature-flags";
import { createURL } from "../../components/HeidiTips/utils";
import i18n from "@humansignal/core/lib/i18n";

export const GeneralSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const { t } = useTranslation();

  const updateProject = useCallback(() => {
    if (project.id) fetchProject(project.id, true);
  }, [project]);

  const colors = ["#FDFDFC", "#FF4C25", "#FF750F", "#ECB800", "#9AC422", "#34988D", "#617ADA", "#CC6FBE"];

  const samplings = [
    { value: "Sequential", key: "sequential" },
    { value: "Uniform", key: "uniform" },
  ];

  return (
    <Block name="general-settings">
      <Elem name={"wrapper"}>
        <h1>{t("settings.general.title")}</h1>
        <Block name="settings-wrapper">
          <Form action="updateProject" formData={{ ...project }} params={{ pk: project.id }} onSubmit={updateProject}>
            <Form.Row columnCount={1} rowGap="16px">
              <Input name="title" label={t("settings.general.form.nameLabel")} />

              <TextArea name="description" label={t("settings.general.form.descriptionLabel")} style={{ minHeight: 128 }} />
              {isFF(FF_LSDV_E_297) && (
                <Block name="workspace-placeholder">
                  <Elem name="badge-wrapper">
                    <Elem name="title">{t("settings.general.form.workspaceLabel")}</Elem>
                    <EnterpriseBadge className="ml-2" />
                  </Elem>
                  <Select placeholder={t("settings.general.form.workspacePlaceholder")} disabled options={[]} />
                  <Typography size="small" className="my-tight">
                    <Trans
                      i18nKey="settings.general.form.workspaceHelper"
                      components={{
                        link: (
                          <a
                            target="_blank"
                            href={createURL(
                              "https://docs.humansignal.com/guide/manage_projects#Create-workspaces-to-organize-projects",
                              {
                                experiment: "project_settings_tip",
                                treatment: "simplify_project_management",
                              },
                            )}
                            rel="noreferrer"
                            className="underline hover:no-underline"
                          />
                        ),
                      }}
                    />
                  </Typography>
                </Block>
              )}
              <RadioGroup name="color" label={t("settings.general.form.colorLabel")} size="large" labelProps={{ size: "large" }}>
                {colors.map((color) => (
                  <RadioGroup.Button key={color} value={color}>
                    <Block name="color" style={{ "--background": color }} />
                  </RadioGroup.Button>
                ))}
              </RadioGroup>

              <RadioGroup label={t("settings.general.sampling.title")} labelProps={{ size: "large" }} name="sampling" simple>
                {samplings.map(({ value, key }) => (
                  <RadioGroup.Button
                    key={value}
                    value={`${value} sampling`}
                    label={t(`settings.general.sampling.options.${key}.label`)}
                    description={t(`settings.general.sampling.options.${key}.description`)}
                  />
                ))}
                {isFF(FF_LSDV_E_297) && (
                  <RadioGroup.Button
                    key="uncertainty-sampling"
                    value=""
                    label={
                      <>
                        {t("settings.general.sampling.options.uncertainty.label")} <EnterpriseBadge className="ml-2" />
                      </>
                    }
                    disabled
                    description={
                      <>
                        <Trans
                          i18nKey="settings.general.sampling.options.uncertainty.description"
                          components={{
                            link: (
                              <a
                                target="_blank"
                                href={createURL("https://docs.humansignal.com/guide/active_learning", {
                                  experiment: "project_settings_workspace",
                                  treatment: "workspaces",
                                })}
                                rel="noreferrer"
                              />
                            ),
                          }}
                        />
                      </>
                    }
                  />
                )}
              </RadioGroup>
            </Form.Row>

            <Form.Actions>
              <Form.Indicator>
                <span case="success">{t("settings.general.form.saved")}</span>
              </Form.Indicator>
              <Button type="submit" className="w-[150px]" aria-label={t("settings.general.form.saveAria")}>
                {t("actions.save")}
              </Button>
            </Form.Actions>
          </Form>
        </Block>
      </Elem>
      {isFF(FF_LSDV_E_297) && <HeidiTips collection="projectSettings" />}
    </Block>
  );
};

GeneralSettings.menuItem = () => i18n.t("settings.menu.general");
GeneralSettings.title = () => i18n.t("settings.general.title");
GeneralSettings.path = "/";
GeneralSettings.exact = true;
