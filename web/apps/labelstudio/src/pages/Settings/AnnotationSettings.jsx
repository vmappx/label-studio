import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "@humansignal/ui";
import { useUpdatePageTitle, createTitleFromSegments } from "@humansignal/core";
import { useTranslation } from "react-i18next";
import { Form, TextArea, Toggle } from "../../components/Form";
import { MenubarContext } from "../../components/Menubar/Menubar";
import { Block, Elem } from "../../utils/bem";

import { ModelVersionSelector } from "./AnnotationSettings/ModelVersionSelector";
import { ProjectContext } from "../../providers/ProjectProvider";
import { Divider } from "../../components/Divider/Divider";
import i18n from "@humansignal/core/lib/i18n";

export const AnnotationSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const pageContext = useContext(MenubarContext);
  const formRef = useRef();
  const [collab, setCollab] = useState(null);
  const { t } = useTranslation();

  useUpdatePageTitle(createTitleFromSegments([project?.title, t("settings.annotation.pageTitle")]));

  useEffect(() => {
    pageContext.setProps({ formRef });
  }, [formRef]);

  const updateProject = useCallback(() => {
    fetchProject(project.id, true);
  }, [project]);

  return (
    <Block name="annotation-settings">
      <Elem name={"wrapper"}>
        <h1>{t("settings.annotation.title")}</h1>
        <Block name="settings-wrapper">
          <Form
            ref={formRef}
            action="updateProject"
            formData={{ ...project }}
            params={{ pk: project.id }}
            onSubmit={updateProject}
          >
            <Form.Row columnCount={1}>
              <Elem name={"header"}>{t("settings.annotation.instructions.header")}</Elem>
              <div className="settings-description">
                <p style={{ marginBottom: "0" }}>{t("settings.annotation.instructions.description1")}</p>
                <p style={{ marginTop: "8px" }}>{t("settings.annotation.instructions.description2")}</p>
              </div>
              <div>
                <Toggle label={t("settings.annotation.instructions.showBeforeLabeling")} name="show_instruction" />
              </div>
              <TextArea name="expert_instruction" style={{ minHeight: 128, maxWidth: "520px" }} />
            </Form.Row>

            <Divider height={32} />

            <Form.Row columnCount={1}>
              <br />
              <Elem name={"header"}>{t("settings.annotation.prelabeling.title")}</Elem>
              <div>
                <Toggle
                  label={t("settings.annotation.prelabeling.toggleLabel")}
                  description={<span>{t("settings.annotation.prelabeling.toggleDescription")}</span>}
                  name="show_collab_predictions"
                  onChange={(e) => {
                    setCollab(e.target.checked);
                  }}
                />
              </div>

              {(collab !== null ? collab : project.show_collab_predictions) && <ModelVersionSelector />}
            </Form.Row>

            <Form.Actions>
              <Form.Indicator>
                <span case="success">{t("settings.common.saved")}</span>
              </Form.Indicator>
              <Button
                type="submit"
                look="primary"
                className="w-[150px]"
                aria-label={t("settings.annotation.form.saveAria")}
              >
                {t("actions.save")}
              </Button>
            </Form.Actions>
          </Form>
        </Block>
      </Elem>
    </Block>
  );
};

AnnotationSettings.title = () => i18n.t("settings.menu.annotation");
AnnotationSettings.path = "/annotation";
