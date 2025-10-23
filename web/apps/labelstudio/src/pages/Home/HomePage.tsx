import { IconExternal, IconFolderAdd, IconHumanSignal, IconUserAdd, IconFolderOpen } from "@humansignal/icons";
import { Button, SimpleCard, Spinner, Typography } from "@humansignal/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUpdatePageTitle } from "@humansignal/core";
import { useTranslation } from "react-i18next";
import { HeidiTips } from "../../components/HeidiTips/HeidiTips";
import { useAPI } from "../../providers/ApiProvider";
import { CreateProject } from "../CreateProject/CreateProject";
import { InviteLink } from "../Organization/PeoplePage/InviteLink";
import type { Page } from "../types/Page";

const PROJECTS_TO_SHOW = 10;

const RESOURCE_LINKS = [
  {
    key: "docs",
    url: "https://labelstud.io/guide/",
  },
  {
    key: "api",
    url: "https://api.labelstud.io/api-reference/introduction/getting-started",
  },
  {
    key: "releases",
    url: "https://labelstud.io/learn/categories/release-notes/",
  },
  {
    key: "blog",
    url: "https://labelstud.io/blog/",
  },
  {
    key: "slack",
    url: "https://slack.labelstud.io",
  },
];

const ACTIONS = [
  {
    key: "createProject",
    icon: IconFolderAdd,
    type: "createProject",
  },
  {
    key: "inviteMembers",
    icon: IconUserAdd,
    type: "inviteMembers",
  },
] as const;

type Action = (typeof ACTIONS)[number]["type"];

export const HomePage: Page = () => {
  const api = useAPI();
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [invitationOpen, setInvitationOpen] = useState(false);
  const { t } = useTranslation();

  useUpdatePageTitle(t("home.pageTitle"));
  const { data, isFetching, isSuccess, isError } = useQuery({
    queryKey: ["projects", { page_size: 10 }],
    async queryFn() {
      return api.callApi<{ results: APIProject[]; count: number }>("projects", {
        params: { page_size: PROJECTS_TO_SHOW },
      });
    },
  });

  const handleActions = (action: Action) => {
    return () => {
      switch (action) {
        case "createProject":
          setCreationDialogOpen(true);
          break;
        case "inviteMembers":
          setInvitationOpen(true);
          break;
      }
    };
  };

  return (
    <main className="p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_450px] gap-6">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Typography variant="headline" size="small">
              {t("home.hero.welcome")}
            </Typography>
            <Typography size="small" className="text-neutral-content-subtler">
              {t("home.hero.subtitle")}
            </Typography>
          </div>
          <div className="flex justify-start gap-4">
            {ACTIONS.map((action) => (
              <Button
                key={action.key}
                look="outlined"
                align="center"
                className="flex-grow-0 text-16/24 gap-2 text-primary-content text-left min-w-[250px] [&_svg]:w-6 [&_svg]:h-6 pl-2"
                onClick={handleActions(action.type)}
                leading={<action.icon />}
              >
                {t(`home.actions.${action.key}`)}
              </Button>
            ))}
          </div>

          <SimpleCard
            title={
              data && data.count > 0 ? (
                <div className="flex items-center justify-between gap-2">
                  <span>{t("home.recentProjects.title")}</span>
                  <a href="/projects" className="text-lg font-normal hover:underline">
                    {t("home.recentProjects.viewAll")}
                  </a>
                </div>
              ) : (
                t("home.recentProjects.title")
              )
            }
          >
            {isFetching ? (
              <div className="h-64 flex justify-center items-center">
                <Spinner />
              </div>
            ) : isError ? (
              <div className="h-64 flex justify-center items-center">{t("home.recentProjects.error")}</div>
            ) : isSuccess && data && data.results.length === 0 ? (
              <div className="flex flex-col justify-center items-center border border-primary-border-subtle bg-primary-emphasis-subtle rounded-lg h-64">
                <div
                  className={
                    "rounded-full w-12 h-12 flex justify-center items-center bg-accent-grape-subtle text-primary-icon"
                  }
                >
                  <IconFolderOpen />
                </div>
                <Typography variant="headline" size="small">
                  {t("home.recentProjects.emptyTitle")}
                </Typography>
                <Typography size="small" className="text-neutral-content-subtler">
                  {t("home.recentProjects.emptyDescription")}
                </Typography>
                <Button
                  className="mt-4"
                  onClick={() => setCreationDialogOpen(true)}
                  aria-label={t("projects.card.createAria")}
                >
                  {t("home.recentProjects.emptyAction")}
                </Button>
              </div>
            ) : isSuccess && data && data.results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {data.results.map((project) => {
                  return <ProjectSimpleCard key={project.id} project={project} />;
                })}
              </div>
            ) : null}
          </SimpleCard>
        </section>
        <section className="flex flex-col gap-6">
          <HeidiTips collection="projectSettings" />
          <SimpleCard
            title={t("home.resources.title")}
            description={t("home.resources.description")}
            data-testid="resources-card"
          >
            <ul>
              {RESOURCE_LINKS.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.url}
                    className="py-2 px-1 flex justify-between items-center text-neutral-content"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t(`home.resources.items.${link.key}`)}
                    <IconExternal className="text-primary-icon" />
                  </a>
                </li>
              ))}
            </ul>
          </SimpleCard>
          <div className="flex gap-2 items-center">
            <IconHumanSignal />
            <span className="text-neutral-content-subtle">{t("home.version")}</span>
          </div>
        </section>
      </div>
      {creationDialogOpen && <CreateProject onClose={() => setCreationDialogOpen(false)} />}
      <InviteLink opened={invitationOpen} onClosed={() => setInvitationOpen(false)} />
    </main>
  );
};

HomePage.title = "Home";
HomePage.path = "/";
HomePage.exact = true;

function ProjectSimpleCard({
  project,
}: {
  project: APIProject;
}) {
  const { t } = useTranslation();
  const finished = project.finished_task_number ?? 0;
  const total = project.task_number ?? 0;
  const progressWidth = (total > 0 ? finished / total : 0) * 100;
  const progressPercent = total > 0 ? Math.round((finished / total) * 100) : 0;
  const white = "#FFFFFF";
  const color = project.color && project.color !== white ? project.color : "#E1DED5";

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block even:bg-neutral-surface rounded-sm overflow-hidden"
      data-external
    >
      <div
        className="grid grid-cols-[minmax(0,1fr)_150px] p-2 py-3 items-center border-l-[3px]"
        style={{ borderLeftColor: color }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-neutral-content">{project.title}</span>
          <div className="text-neutral-content-subtler text-sm">
            {t("home.projectCard.progress", { finished, total, percent: progressPercent })}
          </div>
        </div>
        <div className="bg-neutral-surface rounded-full overflow-hidden w-full h-2 shadow-neutral-border-subtle shadow-border-1">
          <div className="bg-positive-surface-hover h-full" style={{ maxWidth: `${progressWidth}%` }} />
        </div>
      </div>
    </Link>
  );
}
