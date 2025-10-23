import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useCallback, useContext } from "react";

import truncate from "truncate-middle";
import { Dropdown, Menu } from "../../../components";
import { Button } from "@humansignal/ui";
import { confirm } from "../../../components/Modal/Modal";
import { Oneof } from "../../../components/Oneof/Oneof";
import { IconEllipsis } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";
import { ApiContext } from "../../../providers/ApiProvider";
import { Block, cn } from "../../../utils/bem";
import { useTranslation } from "react-i18next";

import "./MachineLearningList.scss";

export const MachineLearningList = ({ backends, fetchBackends, onEdit, onTestRequest, onStartTraining }) => {
  const api = useContext(ApiContext);

  const onDeleteModel = useCallback(
    async (backend) => {
      await api.callApi("deleteMLBackend", {
        params: {
          pk: backend.id,
        },
      });
      await fetchBackends();
    },
    [fetchBackends, api],
  );

  return (
    <div>
      {backends.map((backend) => (
        <BackendCard
          key={backend.id}
          backend={backend}
          onStartTrain={onStartTraining}
          onDelete={onDeleteModel}
          onEdit={onEdit}
          onTestRequest={onTestRequest}
        />
      ))}
    </div>
  );
};

const BackendCard = ({ backend, onStartTrain, onEdit, onDelete, onTestRequest }) => {
  const { t } = useTranslation();
  const confirmDelete = useCallback(
    (backend) => {
      confirm({
        title: t("settings.machineLearning.list.confirmDelete.title"),
        body: t("settings.machineLearning.list.confirmDelete.message"),
        buttonLook: "destructive",
        onOk() {
          onDelete?.(backend);
        },
      });
    },
    [backend, onDelete, t],
  );

  const rootClass = cn("backend-card");

  return (
    <Block name="backend-card">
      <div className={rootClass.elem("title-container")}>
        <div>
          <BackendState backend={backend} />
          <div className={rootClass.elem("title")}>{backend.title}</div>
        </div>

        <div className={rootClass.elem("menu")}>
          <Dropdown.Trigger
            align="right"
            content={
              <Menu size="medium" contextual>
                <Menu.Item onClick={() => onEdit(backend)}>{t("settings.machineLearning.list.menu.edit")}</Menu.Item>
                <Menu.Item onClick={() => onTestRequest(backend)}>
                  {t("settings.machineLearning.list.menu.sendTest")}
                </Menu.Item>
                <Menu.Item onClick={() => onStartTrain(backend)}>
                  {t("settings.machineLearning.list.menu.startTraining")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={() => confirmDelete(backend)} isDangerous>
                  {t("settings.machineLearning.list.menu.delete")}
                </Menu.Item>
              </Menu>
            }
          >
            <Button
              look="string"
              size="small"
              className="!p-0"
              aria-label={t("settings.machineLearning.list.optionsAria")}
            >
              <IconEllipsis />
            </Button>
          </Dropdown.Trigger>
        </div>
      </div>

      <div className={rootClass.elem("meta")}>
        <div className={rootClass.elem("group")}>{truncate(backend.url, 20, 10, "...")}</div>
        <div className={rootClass.elem("group")}>
          <Tooltip title={format(parseISO(backend.created_at), "yyyy-MM-dd HH:mm:ss")}>
            <span>
              {t("settings.machineLearning.list.created", {
                time: formatDistanceToNow(parseISO(backend.created_at), { addSuffix: true }),
              })}
            </span>
          </Tooltip>
        </div>
      </div>
    </Block>
  );
};

const BackendState = ({ backend }) => {
  const { t } = useTranslation();
  const { state } = backend;

  return (
    <div className={cn("ml").elem("status")}>
      <span className={cn("ml").elem("indicator").mod({ state })} />
      <Oneof value={state} className={cn("ml").elem("status-label")}>
        <span case="DI">{t("settings.machineLearning.list.status.disconnected")}</span>
        <span case="CO">{t("settings.machineLearning.list.status.connected")}</span>
        <span case="ER">{t("settings.machineLearning.list.status.error")}</span>
        <span case="TR">{t("settings.machineLearning.list.status.training")}</span>
        <span case="PR">{t("settings.machineLearning.list.status.predicting")}</span>
      </Oneof>
    </div>
  );
};
