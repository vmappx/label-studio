import { useCallback, useState } from "react";
import { Button } from "@humansignal/ui";
import { useAPI } from "../../../providers/ApiProvider";
import { Typography } from "@humansignal/ui";
import { useTranslation } from "react-i18next";

export const StartModelTraining = ({ backend }) => {
  const api = useAPI();
  const [response, setResponse] = useState(null);
  const { t } = useTranslation();

  const onStartTraining = useCallback(
    async (backend) => {
      const res = await api.callApi("trainMLBackend", {
        params: {
          pk: backend.id,
        },
      });

      setResponse(res.response || {});
    },
    [api],
  );

  return (
    <div className="max-w-[680px]">
      <Typography size="small" className="text-neutral-content-subtler">
        {t("settings.machineLearning.startTraining.description")}
      </Typography>
      <Typography size="small" className="text-neutral-content-subtler mt-base mb-wide">
        {t("settings.machineLearning.startTraining.note")}
      </Typography>

      {!response && (
        <Button
          onClick={() => {
            onStartTraining(backend);
          }}
        >
          {t("settings.machineLearning.startTraining.action")}
        </Button>
      )}

      {!!response && (
        <>
          <pre>{t("settings.machineLearning.startTraining.requestSent")}</pre>
          <pre>
            {t("settings.machineLearning.startTraining.responseLabel")}: {JSON.stringify(response, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};
