import { buttonVariant, Space } from "@humansignal/ui";
import { useUpdatePageTitle } from "@humansignal/core";
import { Block } from "apps/labelstudio/src/utils/bem";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "@humansignal/core/lib/i18n";
import type { Page } from "../../types/Page";
import { EmptyList } from "./@components/EmptyList";

export const ModelsPage: Page = () => {
  const { t } = useTranslation();

  useUpdatePageTitle(t("organization.models.pageTitle"));

  return (
    <Block name="prompter">
      <EmptyList />
    </Block>
  );
};

ModelsPage.title = () => i18n.t("organization.models.pageTitle");
ModelsPage.titleRaw = i18n.t("organization.models.pageTitle");
ModelsPage.path = "/models";

ModelsPage.context = () => {
  return (
    <Space size="small">
      <Link to="/prompt/settings" className={buttonVariant({ size: "small" })}>
        {i18n.t("organization.models.actions.createModel")}
      </Link>
    </Space>
  );
};
