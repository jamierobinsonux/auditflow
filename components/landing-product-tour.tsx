"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BarChart3,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Shapes,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

type WorkflowStepId =
  "dashboard" | "analytics" | "createProject" | "manageProject" | "exportReport";

type ScreenId =
  | "dashboard"
  | "analytics"
  | "projects"
  | "projectsReturn"
  | "createProject"
  | "projectOverview"
  | "createdProjectOverview"
  | "newFinding"
  | "evidence"
  | "journeys"
  | "reports"
  | "reportExported";

type SidebarItemId = "dashboard" | "analytics" | "projects" | "frameworks";

type TourAction = {
  id: ScreenId;
  workflow: WorkflowStepId;
  sidebar: SidebarItemId;
  label: string;
  description: string;
  targetKey: string;
};

const workflowSteps: { id: WorkflowStepId; label: string }[] = [
  { id: "dashboard", label: "Open Dashboard" },
  { id: "analytics", label: "Review Analytics" },
  { id: "createProject", label: "Create Project" },
  { id: "manageProject", label: "Manage Project" },
  { id: "exportReport", label: "Export Report" },
];

const tourActions: TourAction[] = [
  {
    id: "dashboard",
    workflow: "dashboard",
    sidebar: "dashboard",
    label: "Open Dashboard",
    description:
      "Start from a portfolio view of active audits, findings, and recent work.",
    targetKey: "sidebar-dashboard",
  },
  {
    id: "analytics",
    workflow: "analytics",
    sidebar: "analytics",
    label: "Review Analytics",
    description:
      "Review project health, finding volume, and audit activity across your portfolio.",
    targetKey: "sidebar-analytics",
  },
  {
    id: "projects",
    workflow: "createProject",
    sidebar: "projects",
    label: "View Existing Projects",
    description:
      "Browse active and archived audits before deciding whether to continue or start new work.",
    targetKey: "sidebar-projects",
  },
  {
    id: "projectOverview",
    workflow: "createProject",
    sidebar: "projects",
    label: "Open Existing Audit",
    description:
      "Open an existing project to review findings, journeys, evidence, and report progress.",
    targetKey: "project-row-saas",
  },
  {
    id: "projectsReturn",
    workflow: "createProject",
    sidebar: "projects",
    label: "Start a New Audit",
    description:
      "Return to Projects when you are ready to create a new audit workspace.",
    targetKey: "sidebar-projects",
  },
  {
    id: "createProject",
    workflow: "createProject",
    sidebar: "projects",
    label: "Create a Project",
    description:
      "Start from a blank project or use a framework when you want a guided audit structure.",
    targetKey: "new-project-button",
  },
  {
    id: "createdProjectOverview",
    workflow: "createProject",
    sidebar: "projects",
    label: "Start Blank Project",
    description:
      "Blank projects let teams define their own structure instead of starting from a template.",
    targetKey: "start-blank-button",
  },
  {
    id: "newFinding",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Add a Finding",
    description:
      "Capture the issue, severity, impact, effort, and recommendation while context is fresh.",
    targetKey: "new-finding-button",
  },
  {
    id: "evidence",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Add Evidence",
    description:
      "Attach screenshots and captions so findings are easy for stakeholders to understand.",
    targetKey: "add-evidence-button",
  },
  {
    id: "journeys",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Add User Journeys",
    description:
      "Map the user journey and connect findings to the steps where friction occurs.",
    targetKey: "tab-journeys",
  },
  {
    id: "reports",
    workflow: "exportReport",
    sidebar: "projects",
    label: "Open Report Builder",
    description:
      "Preview the report, choose the right sections, and prepare a stakeholder-ready PDF.",
    targetKey: "tab-reports",
  },
  {
    id: "reportExported",
    workflow: "exportReport",
    sidebar: "projects",
    label: "Export Report",
    description:
      "Export a polished PDF that packages findings, evidence, journeys, and recommendations.",
    targetKey: "export-pdf-button",
  },
];

export function LandingProductTour() {
  const [activeActionId, setActiveActionId] = useState<ScreenId>("dashboard");
  const [pointerActionId, setPointerActionId] = useState<ScreenId>("dashboard");
  const [isClicking, setIsClicking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pointerPosition, setPointerPosition] = useState({ left: "50%", top: "50%", visible: false });
  const tourFrameRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  const activeIndex = tourActions.findIndex(
    (action) => action.id === activeActionId,
  );
  const activeAction = tourActions[activeIndex] ?? tourActions[0];
  const pointerTarget = useMemo(
    () =>
      tourActions.find((action) => action.id === pointerActionId) ??
      activeAction,
    [activeAction, pointerActionId],
  );

  const updatePointerPosition = useCallback(() => {
    const frame = tourFrameRef.current;
    if (!frame) return;

    const target = frame.querySelector<HTMLElement>(
      `[data-tour-target="${pointerTarget.targetKey}"]`,
    );

    if (!target) {
      setPointerPosition((position) => ({ ...position, visible: false }));
      return;
    }

    const frameRect = frame.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    setPointerPosition({
      left: `${targetRect.left - frameRect.left + targetRect.width / 2}px`,
      top: `${targetRect.top - frameRect.top + targetRect.height / 2}px`,
      visible: true,
    });
  }, [pointerTarget.targetKey]);

  const activeWorkflowIndex = workflowSteps.findIndex(
    (step) => step.id === activeAction.workflow,
  );

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }

  function moveToAction(nextActionId: ScreenId) {
    clearTimers();
    setPointerActionId(nextActionId);
    setIsClicking(false);

    timers.current.push(
      window.setTimeout(() => {
        setIsClicking(true);
      }, 760),
    );

    timers.current.push(
      window.setTimeout(() => {
        setActiveActionId(nextActionId);
      }, 1040),
    );

    timers.current.push(
      window.setTimeout(() => {
        setIsClicking(false);
      }, 1220),
    );
  }

  function moveToWorkflow(workflow: WorkflowStepId) {
    const nextAction = tourActions.find(
      (action) => action.workflow === workflow,
    );
    if (!nextAction) return;
    setIsPlaying(false);
    moveToAction(nextAction.id);
  }

  useEffect(() => {
    updatePointerPosition();
    const raf = window.requestAnimationFrame(updatePointerPosition);
    window.addEventListener("resize", updatePointerPosition);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePointerPosition);
    };
  }, [activeActionId, pointerActionId, updatePointerPosition]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(
      () => {
        const next = tourActions[(activeIndex + 1) % tourActions.length].id;
        moveToAction(next);
      },
      activeAction.workflow === "manageProject" || activeAction.workflow === "createProject" ? 2500 : 3200,
    );

    return () => window.clearTimeout(timer);
  }, [activeAction.workflow, activeIndex, isPlaying]);

  useEffect(() => clearTimers, []);

  return (
    <section id="tour" className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          Product tour
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
          See how an audit comes together.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Follow the complete workflow from portfolio review to project creation,
          finding documentation, journey mapping, and report export.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/70">
        <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-white px-5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-5 rounded-full bg-slate-100 px-5 py-1.5 text-xs font-semibold text-slate-500">
            auditflow.app/workspace
          </span>
          <button
            type="button"
            onClick={() => setIsPlaying((value) => !value)}
            className="ml-auto rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div ref={tourFrameRef} className="relative grid h-[660px] grid-cols-[240px_minmax(0,1fr)] overflow-hidden bg-slate-100">
          <AppSidebar active={activeAction.sidebar} />
          <main className="overflow-hidden bg-slate-100 p-7">
            <ProductScreen screen={activeActionId} />
          </main>
          <MovingClickDot
            left={pointerPosition.left}
            top={pointerPosition.top}
            visible={pointerPosition.visible}
            isClicking={isClicking}
          />
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-3xl text-center">
        <p className="text-sm font-semibold text-violet-700">
          {activeAction.label}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {activeAction.description}
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-6xl overflow-x-auto pb-2">
        <div className="flex min-w-max items-center justify-center gap-2 px-1">
          {workflowSteps.map((step, index) => {
            const isActive = step.id === activeAction.workflow;
            const isComplete = index < activeWorkflowIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => moveToWorkflow(step.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : isComplete
                      ? "border-slate-200 bg-white text-slate-700"
                      : "border-slate-200 bg-white/80 text-slate-500 hover:bg-white"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : isComplete
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MovingClickDot({
  left,
  top,
  visible,
  isClicking,
}: {
  left: string;
  top: string;
  visible: boolean;
  isClicking: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-30 transition-all duration-[850ms] ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ left, top, transform: "translate(-50%, -50%)" }}
      aria-hidden="true"
    >
      <div
        className={`h-3.5 w-3.5 rounded-full bg-violet-300 shadow-sm transition-transform duration-150 ${
          isClicking ? "scale-75" : "scale-100"
        }`}
      />
    </div>
  );
}

function AppSidebar({ active }: { active: SidebarItemId }) {
  const workspaceItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

  const auditItems = [
    { id: "projects" as const, label: "Projects", icon: FolderKanban },
    { id: "frameworks" as const, label: "Frameworks", icon: Shapes },
  ];

  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <BrandLogo size={26} />
      </div>

      <nav className="flex-1 px-4 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Workspace
        </p>
        <div className="space-y-1">
          {workspaceItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={active === item.id}
            />
          ))}
        </div>

        <p className="mb-3 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Audits
        </p>
        <div className="space-y-1">
          {auditItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={active === item.id}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <SidebarUtility icon={Settings} label="Settings" />
        <SidebarUtility icon={CreditCard} label="Billing" />

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              JR
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Jamie Robinson
              </p>
              <p className="truncate text-xs text-slate-500">
                jamie@auditflow.app
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <LogOut size={14} />
            Sign out
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  item,
  active,
}: {
  item: { id?: string; label: string; icon: ElementType };
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <div
      data-tour-target={item.id ? `sidebar-${item.id}` : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
        active ? "bg-violet-50 text-violet-700" : "text-slate-600"
      }`}
    >
      <Icon size={18} strokeWidth={2} />
      {item.label}
    </div>
  );
}

function SidebarUtility({
  icon: Icon,
  label,
}: {
  icon: ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600">
      <Icon size={18} strokeWidth={2} />
      {label}
    </div>
  );
}

function ProductScreen({ screen }: { screen: ScreenId }) {
  if (screen === "analytics") return <AnalyticsScreen />;
  if (screen === "projects" || screen === "projectsReturn") return <ProjectsScreen />;
  if (screen === "createProject") return <CreateProjectScreen />;
  if (screen === "projectOverview" || screen === "createdProjectOverview") return <ProjectOverviewScreen />;
  if (screen === "newFinding") return <NewFindingScreen />;
  if (screen === "evidence") return <EvidenceScreen />;
  if (screen === "journeys") return <JourneyMapsScreen />;
  if (screen === "reports") return <ReportsScreen />;
  if (screen === "reportExported") return <ReportsScreen exported />;
  return <DashboardScreen />;
}

function DashboardScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Welcome, Jamie Robinson
          </h3>
          <p className="mt-3 text-base text-slate-500">
            You have 4 projects, 6 findings, and 6 open findings.
          </p>
        </div>
        <span data-tour-target="new-project-button" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Project
        </span>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <DashboardStat
          value="4"
          label="Projects"
          description="Based on your audit data"
        />
        <DashboardStat
          value="6"
          label="Findings"
          description="Based on your audit data"
        />
        <DashboardStat
          value="4"
          label="Recommendations"
          description="Based on your audit data"
        />
        <DashboardStat
          value="2"
          label="Completed Audits"
          description="Based on your audit data"
        />
      </div>

      <div className="mt-8">
        <h4 className="text-xl font-semibold text-slate-950">
          Recent Projects
        </h4>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr] bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Project</span>
            <span>Type</span>
            <span>Findings</span>
            <span>Status</span>
          </div>
          <ProjectTableRow
            name="SaaS Example"
            url="No website"
            type="SaaS"
            findings="1"
            status="In Progress"
          />
          <ProjectTableRow
            name="Dunkin Audit"
            url="dunkin.com"
            type="Mobile App"
            findings="2"
            status="Completed"
          />
          <ProjectTableRow
            name="AuditFlow Audit"
            url="auditflow.com"
            type="SaaS"
            findings="2"
            status="In Progress"
          />
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Analytics
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Portfolio and finding-level insights across your audit work.
          </p>
        </div>
        <span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm">
          Dashboard
        </span>
      </div>

      <div className="mt-8">
        <h4 className="text-xl font-semibold text-slate-950">
          Portfolio Overview
        </h4>
        <p className="mt-2 text-base text-slate-500">
          Project-level health across your audit portfolio.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-4">
        <DashboardStat
          value="4"
          label="Total projects"
          description="All audit projects"
        />
        <DashboardStat
          value="6"
          label="Total findings"
          description="Across all projects"
        />
        <DashboardStat
          value="1.5"
          label="Avg. findings / project"
          description="Audit size indicator"
        />
        <DashboardStat
          value="2"
          label="Completed projects"
          description="Project status = completed"
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-950">
            Projects by status
          </h4>
          <p className="mt-2 text-sm text-slate-500">
            Current status of your audit projects.
          </p>
          <div className="mt-8 flex items-center gap-10">
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#22c55e_0_50%,#8b5cf6_50%_100%)]">
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-semibold text-slate-950">4</span>
                <span className="text-xs text-slate-500">Projects</span>
              </div>
            </div>
            <div className="flex-1 space-y-5">
              <ProgressRow label="In Progress" value="2 / 50%" width="50%" />
              <ProgressRow
                label="Completed"
                value="2 / 50%"
                width="50%"
                color="bg-green-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-950">
            Findings by project
          </h4>
          <p className="mt-2 text-sm text-slate-500">
            Top projects by finding volume.
          </p>
          <div className="mt-8 space-y-5">
            <BarRow
              title="AuditFlow Audit"
              subtitle="2 open findings"
              value="2 findings"
              width="100%"
            />
            <BarRow
              title="Dunkin Audit"
              subtitle="2 open findings"
              value="2 findings"
              width="100%"
            />
            <BarRow
              title="SaaS Example"
              subtitle="1 open finding"
              value="1 finding"
              width="50%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProjectScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Create Project
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Start from scratch or use a framework when you want a guided audit structure.
          </p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          Create Project
        </span>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-5">
          <div>
            <h4 className="text-xl font-semibold text-slate-950">New audit project</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose how you want to begin. Templates are optional.
            </p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            Flexible setup
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5">
            <p className="text-sm font-semibold text-violet-800">Blank project</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start with an empty workspace and define your own audit structure.
            </p>
            <div data-tour-target="start-blank-button" className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
              Start blank
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-950">Use a framework</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pick SaaS, mobile, ecommerce, or accessibility when you want a head start.
            </p>
            <div className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
              Browse frameworks
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <FormLabel>Project name</FormLabel>
          <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900">
            Mobile App Audit
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Projects
          </h3>
          <p className="mt-2 text-base text-slate-500">
            View existing audits, reopen active work, or create a new project.
          </p>
        </div>
        <span data-tour-target="new-project-button" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Project
        </span>
      </div>

      <div className="mt-7 flex gap-2">
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-100">
          Active
        </span>
        <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
          Archived
        </span>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ProjectListRow
          targetKey="project-row-saas"
          name="SaaS Example"
          url="No website provided"
          status="In Progress"
          date="6/28/2026"
        />
        <ProjectListRow
          name="Dunkin Audit"
          url="dunkin.com"
          status="Completed"
          date="6/26/2026"
        />
        <ProjectListRow
          name="AuditFlow Audit"
          url="auditflow.com"
          status="In Progress"
          date="6/26/2026"
        />
        <ProjectListRow
          name="Test Project"
          url="jamierobinsonux.com"
          status="Completed"
          date="6/26/2026"
        />
      </div>
    </div>
  );
}

function ProjectOverviewScreen() {
  return (
    <ProjectWorkspaceShell activeTab="overview">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Project workspace
          </p>
          <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Mobile App Audit
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Review findings, user journeys, evidence, and report progress in one place.
          </p>
        </div>
        <span data-tour-target="new-finding-button" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Finding
        </span>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <DashboardStat
          value="0"
          label="Open findings"
          description="Start documenting issues"
        />
        <DashboardStat
          value="4"
          label="Audit areas"
          description="Ready to review"
        />
        <DashboardStat
          value="1"
          label="Journey map"
          description="Ready to customize"
        />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-950">
            Audit checklist
          </h4>
          <div className="mt-5 space-y-3 text-sm font-medium text-slate-600">
            <p>✓ First launch and permissions</p>
            <p>✓ Core navigation</p>
            <p>✓ Primary task flow</p>
            <p>✓ Error recovery and feedback</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-950">
            Primary journey
          </h4>
          <p className="mt-2 text-sm text-slate-500">
            First launch → Browse → Complete task
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
              First launch
            </span>
            <span>→</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Browse</span>
            <span>→</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Task completion
            </span>
          </div>
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function NewFindingScreen() {
  return (
    <ProjectWorkspaceShell activeTab="findings">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            New finding
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Capture the issue, impact, and recommendation.
          </p>
        </div>
        <span data-tour-target="add-evidence-button" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          Add Evidence
        </span>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormLabel>Finding title</FormLabel>
          <div className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            Checkout error recovery is unclear
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField label="Severity" value="High" />
            <FormField label="Journey" value="Primary Task Flow" />
            <FormField label="Impact" value="High" />
            <FormField label="Effort" value="Medium" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormLabel>Recommendation</FormLabel>
          <div className="mt-2 min-h-[142px] rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
            Make the recovery action more visible and preserve user progress
            when an error occurs.
          </div>
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function EvidenceScreen() {
  return (
    <ProjectWorkspaceShell activeTab="findings">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Checkout error recovery is unclear
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Add evidence so the issue is clear to stakeholders.
          </p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          Save Finding
        </span>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold text-slate-950">
          Evidence images
        </h4>
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Image 1</p>
            <div className="mt-4 rounded-2xl border-2 border-dashed border-violet-200 bg-white px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lg font-semibold text-violet-700">
                +
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Drag and drop evidence
              </p>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG, or WebP</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <FormLabel>Image caption</FormLabel>
            <div className="mt-2 min-h-[154px] rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-500">
              Checkout screen showing the error state after validation fails.
            </div>
          </div>
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function JourneyMapsScreen() {
  return (
    <ProjectWorkspaceShell activeTab="journeys">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Journey Maps
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Connect findings to steps in the user journey.
          </p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + Add Step
        </span>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold text-slate-950">
          Primary Task Flow
        </h4>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <JourneyStep title="First launch" status="Clear" />
          <JourneyStep title="Browse options" status="Needs review" />
          <JourneyStep
            title="Task completion"
            status="High-priority finding"
            active
          />
        </div>
        <div className="mt-6 rounded-2xl bg-violet-50 p-5">
          <p className="text-sm font-semibold text-violet-800">
            Linked finding
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Checkout error recovery is unclear
          </p>
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function ReportsScreen({ exported = false }: { exported?: boolean }) {
  return (
    <ProjectWorkspaceShell activeTab="reports">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Report Builder
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Configure and export a client-ready UX audit report.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm">
            Preview
          </span>
          <span data-tour-target="export-pdf-button" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
            Export PDF
          </span>
        </div>
      </div>

      {exported && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          Report exported successfully.
        </div>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-950">Template</h4>
          <div className="mt-5 space-y-3">
            <TemplateOption active label="Professional" />
            <TemplateOption label="Executive" />
            <TemplateOption label="Accessibility" />
          </div>

          <h4 className="mt-7 text-xl font-semibold text-slate-950">
            Sections
          </h4>
          <div className="mt-4 space-y-3 text-sm font-medium text-slate-600">
            <p>✓ Executive summary</p>
            <p>✓ Findings</p>
            <p>✓ Journey analysis</p>
            <p>✓ Recommendations</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-slate-950">Preview</h4>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <MiniReportPage title="Cover" />
            <MiniReportPage title="Summary" />
            <MiniReportPage title="Finding" />
          </div>
        </div>
      </div>
    </ProjectWorkspaceShell>
  );
}

function ProjectWorkspaceShell({
  activeTab,
  children,
}: {
  activeTab: "overview" | "findings" | "journeys" | "reports";
  children: ReactNode;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "findings" as const, label: "Findings" },
    { id: "journeys" as const, label: "Journey Maps" },
    { id: "reports" as const, label: "Reports" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <span
            key={tab.id}
            data-tour-target={`tab-${tab.id}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? "bg-violet-50 text-violet-700"
                : "text-slate-600"
            }`}
          >
            {tab.label}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

function DashboardStat({
  value,
  label,
  description,
}: {
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-3 text-sm font-medium text-slate-900">{label}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function ProjectListRow({
  name,
  url,
  status,
  date,
  targetKey,
}: {
  name: string;
  url: string;
  status: string;
  date: string;
  targetKey?: string;
}) {
  return (
    <div data-tour-target={targetKey} className="flex items-center justify-between border-b border-slate-100 px-6 py-5 last:border-b-0">
      <div>
        <p className="text-base font-semibold text-slate-950">{name}</p>
        <p className="mt-1 text-sm text-slate-500">{url}</p>
      </div>
      <div className="text-right">
        <StatusPill status={status} />
        <p className="mt-2 text-sm text-slate-400">{date}</p>
      </div>
    </div>
  );
}

function ProjectTableRow({
  name,
  url,
  type,
  findings,
  status,
}: {
  name: string;
  url: string;
  type: string;
  findings: string;
  status: string;
}) {
  return (
    <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.9fr] items-center border-b border-slate-100 px-6 py-4 text-sm last:border-b-0">
      <div>
        <p className="font-semibold text-slate-950">{name}</p>
        <p className="mt-1 text-xs text-slate-500">{url}</p>
      </div>
      <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        {type}
      </span>
      <span className="text-slate-600">{findings}</span>
      <StatusPill status={status} />
    </div>
  );
}

function FrameworkCard({
  type,
  title,
  description,
  items,
}: {
  type: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
        {type}
      </p>
      <h4 className="mt-3 text-xl font-semibold text-slate-950">{title}</h4>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Includes
        </p>
        {items.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
      <div className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-100">
        Use Framework
      </div>
    </div>
  );
}

function JourneyStep({
  title,
  status,
  active = false,
}: {
  title: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${active ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-slate-50"}`}
    >
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p
        className={`mt-2 text-xs font-semibold ${active ? "text-violet-700" : "text-slate-500"}`}
      >
        {status}
      </p>
    </div>
  );
}

function FormLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const completed = status === "Completed" || status === "Ready";
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
    >
      {status}
    </span>
  );
}

function ProgressRow({
  label,
  value,
  width,
  color = "bg-violet-500",
}: {
  label: string;
  value: string;
  width: string;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function BarRow({
  title,
  subtitle,
  value,
  width,
}: {
  title: string;
  subtitle: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3 text-sm font-semibold text-slate-700">
        <div>
          <p>{title}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
        </div>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-violet-500" style={{ width }} />
      </div>
    </div>
  );
}

function TemplateOption({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
        active
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {label}
    </div>
  );
}

function MiniReportPage({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600">
        {title}
      </p>
      <div className="mt-4 h-3 w-16 rounded-full bg-slate-950" />
      <div className="mt-5 space-y-2">
        <div className="h-2 rounded-full bg-slate-200" />
        <div className="h-2 w-3/4 rounded-full bg-slate-200" />
        <div className="h-2 w-1/2 rounded-full bg-slate-200" />
      </div>
      <div className="mt-6 h-16 rounded-xl bg-white" />
    </div>
  );
}
