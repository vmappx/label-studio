import { useState } from "react";
import { Button } from "@humansignal/ui";
import { ErrorWrapper } from "../../../components/Error/Error";
import { InlineError } from "../../../components/Error/InlineError";
import { Form, Input, Select, TextArea, Toggle } from "../../../components/Form";
import "./MachineLearningSettings.scss";
import { useTranslation } from "react-i18next";

const CustomBackendForm = ({ action, backend, project, onSubmit }) => {
  const [selectedAuthMethod, setAuthMethod] = useState("NONE");
  const [, setMLError] = useState();
  const { t } = useTranslation();

  return (
    <Form
      action={action}
      formData={{ ...(backend ?? {}) }}
      params={{ pk: backend?.id }}
      onSubmit={async (response) => {
        if (!response.error_message) {
          onSubmit(response);
        }
      }}
    >
      <Input type="hidden" name="project" value={project.id} />

      <Form.Row columnCount={1}>
        <Input
          name="title"
          label={t("settings.machineLearning.form.nameLabel")}
          placeholder={t("settings.machineLearning.form.namePlaceholder")}
          required
        />
      </Form.Row>

      <Form.Row columnCount={1}>
        <Input name="url" label={t("settings.machineLearning.form.urlLabel")} required />
      </Form.Row>

      <Form.Row columnCount={2}>
        <Select
          name="auth_method"
          label={t("settings.machineLearning.form.authMethodLabel")}
          options={[
            { label: t("settings.machineLearning.form.authMethods.none"), value: "NONE" },
            { label: t("settings.machineLearning.form.authMethods.basic"), value: "BASIC_AUTH" },
          ]}
          value={selectedAuthMethod}
          onChange={setAuthMethod}
        />
      </Form.Row>

      {(backend?.auth_method === "BASIC_AUTH" || selectedAuthMethod === "BASIC_AUTH") && (
        <Form.Row columnCount={2}>
          <Input name="basic_auth_user" label={t("settings.machineLearning.form.basicAuthUser")} />
          {backend?.basic_auth_pass_is_set ? (
            <Input
              name="basic_auth_pass"
              label={t("settings.machineLearning.form.basicAuthPass")}
              type="password"
              placeholder="********"
            />
          ) : (
            <Input name="basic_auth_pass" label={t("settings.machineLearning.form.basicAuthPass")} type="password" />
          )}
        </Form.Row>
      )}

      <Form.Row columnCount={1}>
        <TextArea
          name="extra_params"
          label={t("settings.machineLearning.form.extraParams")}
          style={{ minHeight: 120 }}
        />
      </Form.Row>

      <Form.Row columnCount={1}>
        <Toggle
          name="is_interactive"
          label={t("settings.machineLearning.form.interactiveLabel")}
          description={t("settings.machineLearning.form.interactiveDescription")}
        />
      </Form.Row>

      <Form.Actions>
        <Button
          type="submit"
          look="primary"
          onClick={() => setMLError(null)}
          aria-label={t("settings.machineLearning.form.validateAria")}
        >
          {t("settings.machineLearning.form.validateAndSave")}
        </Button>
      </Form.Actions>

      <Form.ResponseParser>
        {(response) => (
          <>
            {response.error_message && (
              <ErrorWrapper
                error={{
                  response: {
                    detail: t(
                      backend
                        ? "settings.machineLearning.form.errorUpdate"
                        : "settings.machineLearning.form.errorCreate",
                    ),
                    exc_info: response.error_message,
                  },
                }}
              />
            )}
          </>
        )}
      </Form.ResponseParser>

      <InlineError />
    </Form>
  );
};

export { CustomBackendForm };
