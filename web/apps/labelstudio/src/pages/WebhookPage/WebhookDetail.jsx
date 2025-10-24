import { IconCross, IconPlus } from "@humansignal/icons";
import { Button } from "@humansignal/ui";
import cloneDeep from "lodash/cloneDeep";
import { useEffect, useState } from "react";
import { Form, Input, Label, Toggle } from "../../components/Form";
import { useAPI } from "../../providers/ApiProvider";
import { Block, cn, Elem } from "../../utils/bem";
import "./WebhookPage.scss";
import { Space } from "../../components/Space/Space";
import { useProject } from "../../providers/ProjectProvider";
import { WebhookDeleteModal } from "./WebhookDeleteModal";
import { useTranslation } from "react-i18next";

const WebhookDetail = ({ webhook, webhooksInfo, fetchWebhooks, onBack, onSelectActive }) => {
  // if webhook === null - create mod
  // else update
  const rootClass = cn("webhook-detail");

  const api = useAPI();
  const [headers, setHeaders] = useState(
    webhook?.headers
      ? Object.entries(webhook.headers).map(([key, value], index) => ({
          id: `header-${Date.now()}-${index}`,
          key,
          value,
        }))
      : [],
  );
  const [sendForAllActions, setSendForAllActions] = useState(webhook ? webhook.send_for_all_actions : true);
  const [actions, setActions] = useState(new Set(webhook?.actions));
  const [isActive, setIsActive] = useState(webhook ? webhook.is_active : true);
  const [sendPayload, setSendPayload] = useState(webhook ? webhook.send_payload : true);
  const { project } = useProject();
  const [projectId, setProjectId] = useState(project.id);
  const { t } = useTranslation();

  useEffect(() => {
    if (Object.keys(project).length === 0) {
      setProjectId(null);
    } else {
      setProjectId(project.id);
    }
  }, [project]);

  const onAddHeaderClick = () => {
    setHeaders([
      ...headers,
      {
        id: `header-${Date.now()}-${Math.random()}`,
        key: "",
        value: "",
      },
    ]);
  };
  const onHeaderRemove = (index) => {
    const newHeaders = cloneDeep(headers);

    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };
  const onHeaderChange = (aim, event, index) => {
    const newHeaders = cloneDeep(headers);

    if (aim === "key") {
      newHeaders[index].key = event.target.value;
    }
    if (aim === "value") {
      newHeaders[index].value = event.target.value;
    }
    setHeaders(newHeaders);
  };

  const onActionChange = (event) => {
    const newActions = new Set(actions);

    if (event.target.checked) {
      newActions.add(event.target.name);
    } else {
      newActions.delete(event.target.name);
    }
    setActions(newActions);
  };

  useEffect(() => {
    if (webhook === null) {
      setHeaders([]);
      setSendForAllActions(true);
      setActions(new Set());
      setIsActive(true);
      setSendPayload(true);
      return;
    }
    setHeaders(
      Object.entries(webhook.headers).map(([key, value], index) => ({
        id: `header-${Date.now()}-${index}`,
        key,
        value,
      })),
    );
    setSendForAllActions(webhook.send_for_all_actions);
    setActions(new Set(webhook.actions));
    setIsActive(webhook.is_active);
    setSendPayload(webhook.send_payload);
  }, [webhook]);

  if (projectId === undefined) return <></>;
  return (
    <Block name="webhook">
      <Elem name="title">
        <>
          <Elem
            tag="span"
            name="title-base"
            onClick={() => {
              onSelectActive(null);
            }}
          >
            {t("organization.webhooks.detail.title")}
          </Elem>{" "}
          / {webhook === null ? t("organization.webhooks.detail.new") : t("organization.webhooks.detail.edit")}
        </>
      </Elem>
      <Elem name="content">
        <Block name={"webhook-detail"}>
          <Form
            action={webhook === null ? "createWebhook" : "updateWebhook"}
            params={webhook === null ? {} : { pk: webhook.id }}
            formData={webhook}
            prepareData={(data) => {
              return {
                ...data,
                project: projectId,
                send_for_all_actions: sendForAllActions,
                headers: Object.fromEntries(
                  headers.filter((header) => header.key !== "").map((header) => [header.key, header.value]),
                ),
                actions: Array.from(actions),
                is_active: isActive,
                send_payload: sendPayload,
              };
            }}
            onSubmit={async (response) => {
              if (!response.error_message) {
                await fetchWebhooks();
                onSelectActive(null);
              }
            }}
          >
            <Form.Row columnCount={1}>
              <Label text={t("organization.webhooks.detail.payloadUrl")} large />
              <Space className={rootClass.elem("url-space")}>
                <Input
                  name="url"
                  className={rootClass.elem("url-input")}
                  placeholder={t("organization.webhooks.detail.urlPlaceholder")}
                />
                <Space align="end" className={rootClass.elem("activator")}>
                  <span className={rootClass.elem("black-text")}>{t("organization.webhooks.detail.isActive")}</span>
                  <Toggle
                    skip
                    checked={isActive}
                    onChange={(e) => {
                      setIsActive(e.target.checked);
                    }}
                  />
                </Space>
              </Space>
            </Form.Row>
            <Form.Row columnCount={1}>
              <div className={rootClass.elem("headers")}>
                <div className={rootClass.elem("headers-content")}>
                  <Space spread className={rootClass.elem("headers-control")}>
                    <Label text={t("organization.webhooks.detail.headers")} large />
                    <Button
                      type="button"
                      onClick={onAddHeaderClick}
                      look="string"
                      leading={<IconPlus />}
                      className={rootClass.elem("headers-add")}
                      tooltip={t("organization.webhooks.detail.addHeaderTooltip")}
                    />
                  </Space>
                  {headers.map((header, index) => {
                    return (
                      <Space key={header.id} className={rootClass.elem("headers-row")} columnCount={3}>
                        <Input
                          className={rootClass.elem("headers-input")}
                          skip
                          placeholder={t("organization.webhooks.detail.headerPlaceholder")}
                          value={header.key}
                          onChange={(e) => onHeaderChange("key", e, index)}
                        />
                        <Input
                          className={rootClass.elem("headers-input")}
                          skip
                          placeholder={t("organization.webhooks.detail.valuePlaceholder")}
                          value={header.value}
                          onChange={(e) => onHeaderChange("value", e, index)}
                        />
                        <div>
                          <Button
                            className={rootClass.elem("headers-remove")}
                            type="button"
                            variant="negative"
                            look="string"
                            icon={<IconCross />}
                            onClick={() => onHeaderRemove(index)}
                            tooltip={t("organization.webhooks.detail.removeHeaderTooltip")}
                          />
                        </div>
                      </Space>
                    );
                  })}
                </div>
              </div>
            </Form.Row>
            <Block name="webhook-payload">
              <Elem name="title">
                <Label text={t("organization.webhooks.detail.payloadSection")} large />
              </Elem>
              <Elem name="content">
                <Elem name="content-row">
                  <Toggle
                    skip
                    checked={sendPayload}
                    onChange={(e) => {
                      setSendPayload(e.target.checked);
                    }}
                    label={t("organization.webhooks.detail.sendPayload")}
                  />
                </Elem>
                <Elem name="content-row">
                  <Toggle
                    skip
                    checked={sendForAllActions}
                    label={t("organization.webhooks.detail.sendForAll")}
                    onChange={(e) => {
                      setSendForAllActions(e.target.checked);
                    }}
                  />
                </Elem>
                <div>
                  {!sendForAllActions ? (
                    <Elem name="content-row-actions">
                      <Elem tag="h4" name="title" mod={{ black: true }}>
                        {t("organization.webhooks.detail.sendPayloadFor")}
                      </Elem>
                      <Elem name="actions">
                        {Object.entries(webhooksInfo).map(([key, value]) => {
                          return (
                            <Form.Row key={key} columnCount={1}>
                              <div>
                                <Toggle
                                  skip
                                  name={key}
                                  type="checkbox"
                                  label={value.name}
                                  onChange={onActionChange}
                                  checked={actions.has(key)}
                                />
                              </div>
                            </Form.Row>
                          );
                        })}
                      </Elem>
                    </Elem>
                  ) : null}
                </div>
              </Elem>
            </Block>
            <Elem name="controls">
              {webhook === null ? (
                <Space align="end">
                  <div className={rootClass.elem("status")}>
                    <Form.Indicator />
                  </div>
                  <Button
                    type="button"
                    variant="neutral"
                    look="outlined"
                    className={rootClass.elem("cancel-button")}
                    onClick={onBack}
                    aria-label={t("organization.webhooks.detail.cancelAria")}
                  >
                    {t("organization.webhooks.detail.cancel")}
                  </Button>
                  <Button
                    className={rootClass.elem("save-button")}
                    aria-label={t("organization.webhooks.detail.addAria")}
                  >
                    {t("organization.webhooks.detail.add")}
                  </Button>
                </Space>
              ) : (
                <Space spread>
                  <Button
                    variant="negative"
                    look="outlined"
                    type="button"
                    className={rootClass.elem("delete-button")}
                    onClick={() =>
                      WebhookDeleteModal({
                        onDelete: async () => {
                          await api.callApi("deleteWebhook", {
                            params: { pk: webhook.id },
                          });
                          onBack();
                          await fetchWebhooks();
                        },
                      })
                    }
                  >
                    {t("organization.webhooks.detail.delete")}
                  </Button>
                  <Space>
                    <div className={rootClass.elem("status")}>
                      <Form.Indicator />
                    </div>
                    <Button
                      type="button"
                      variant="neutral"
                      look="outlined"
                      className={rootClass.elem("cancel-button")}
                      onClick={onBack}
                      aria-label={t("organization.webhooks.detail.cancelAria")}
                    >
                      {t("organization.webhooks.detail.cancel")}
                    </Button>
                    <Button
                      className={rootClass.elem("save-button")}
                      aria-label={t("organization.webhooks.detail.saveAria")}
                    >
                      {t("organization.webhooks.detail.save")}
                    </Button>
                  </Space>
                </Space>
              )}
            </Elem>
          </Form>
        </Block>
      </Elem>
    </Block>
  );
};

export default WebhookDetail;
