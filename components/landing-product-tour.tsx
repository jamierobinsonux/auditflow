"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BarChart3,
  Building2,
  CloudUpload,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  LogOut,
  Settings,
  Shapes,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

type WorkflowStepId =
  | "dashboard"
  | "analytics"
  | "clients"
  | "frameworks"
  | "manageProject"
  | "exportReport";

type ScreenId =
  | "dashboard"
  | "analytics"
  | "clients"
  | "projects"
  | "projectsForFramework"
  | "createProject"
  | "createProjectSubmit"
  | "frameworks"
  | "projectOverview"
  | "createdProjectOverview"
  | "frameworkApplied"
  | "newFinding"
  | "newFindingSubmit"
  | "evidence"
  | "journeys"
  | "recommendations"
  | "reports"
  | "reportExported";

type SidebarItemId =
  | "dashboard"
  | "analytics"
  | "projects"
  | "clients"
  | "reports"
  | "recommendations"
  | "frameworks";

type TourAction = {
  id: ScreenId;
  workflow: WorkflowStepId;
  sidebar: SidebarItemId;
  label: string;
  description: string;
  targetKey: string;
};

const workflowSteps: { id: WorkflowStepId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "clients", label: "Clients" },
  { id: "frameworks", label: "Frameworks" },
  { id: "manageProject", label: "Project Work" },
  { id: "exportReport", label: "Reports" },
];

const tourActions: TourAction[] = [
  {
    id: "dashboard",
    workflow: "dashboard",
    sidebar: "dashboard",
    label: "Track audit work",
    description:
      "Start from a portfolio view of active audits, recommendations, open findings, and recent work.",
    targetKey: "sidebar-dashboard",
  },
  {
    id: "analytics",
    workflow: "analytics",
    sidebar: "analytics",
    label: "Review audit health",
    description:
      "Use analytics to see where findings, project status, and audit activity are concentrated.",
    targetKey: "sidebar-analytics",
  },
  {
    id: "clients",
    workflow: "clients",
    sidebar: "clients",
    label: "Manage clients",
    description:
      "Studio workspaces keep each client’s projects, reports, brand assets, and activity together.",
    targetKey: "sidebar-clients",
  },
  {
    id: "projects",
    workflow: "clients",
    sidebar: "projects",
    label: "View projects",
    description:
      "Browse existing projects, continue active audits, or start something new for a client.",
    targetKey: "sidebar-projects",
  },
  {
    id: "projectOverview",
    workflow: "clients",
    sidebar: "projects",
    label: "Open an existing audit",
    description:
      "Open a project to review findings, journeys, evidence, recommendations, and report progress.",
    targetKey: "project-row-checkout",
  },
  {
    id: "projectsForFramework",
    workflow: "frameworks",
    sidebar: "projects",
    label: "Start a new audit",
    description:
      "Return to Projects when it is time to create another audit workspace.",
    targetKey: "sidebar-projects",
  },
  {
    id: "createProject",
    workflow: "frameworks",
    sidebar: "projects",
    label: "Create a project",
    description:
      "Start blank or choose a reusable Studio framework when the audit should follow a standard process.",
    targetKey: "new-project-button",
  },
  {
    id: "createProjectSubmit",
    workflow: "frameworks",
    sidebar: "projects",
    label: "Create the project",
    description:
      "Scroll to the bottom of the project form and submit the project setup.",
    targetKey: "create-project-submit",
  },
  {
    id: "frameworks",
    workflow: "frameworks",
    sidebar: "frameworks",
    label: "Choose a framework",
    description:
      "Projects can start blank, or use a framework for categories, journeys, recommendations, and report defaults.",
    targetKey: "use-framework-button",
  },
  {
    id: "frameworkApplied",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Apply the framework",
    description:
      "Frameworks can bring in categories, journey stages, recommendations, and report defaults.",
    targetKey: "framework-card-saas",
  },
  {
    id: "createdProjectOverview",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Manage the project",
    description:
      "The project workspace keeps findings, evidence, journeys, recommendations, and reports connected.",
    targetKey: "new-finding-button",
  },
  {
    id: "newFinding",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Add findings",
    description:
      "Capture severity, impact, effort, journey context, and a recommended next step while the issue is fresh.",
    targetKey: "new-finding-button",
  },
  {
    id: "newFindingSubmit",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Save the finding",
    description:
      "Scroll through the creation form to the evidence section and submit the new finding.",
    targetKey: "add-finding-submit",
  },
  {
    id: "evidence",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Attach evidence",
    description:
      "Add screenshots and captions so stakeholders can understand exactly what happened.",
    targetKey: "save-finding-button",
  },
  {
    id: "journeys",
    workflow: "manageProject",
    sidebar: "projects",
    label: "Map user journeys",
    description:
      "Connect findings to the exact steps where users experience friction.",
    targetKey: "tab-journeys",
  },
  {
    id: "recommendations",
    workflow: "manageProject",
    sidebar: "recommendations",
    label: "Reuse recommendations",
    description:
      "Studio teams can maintain reusable guidance and insert it into findings for consistent deliverables.",
    targetKey: "sidebar-recommendations",
  },
  {
    id: "reports",
    workflow: "exportReport",
    sidebar: "projects",
    label: "Open project reports",
    description:
      "Start from the project workspace and click the Reports tab to build the client-ready export.",
    targetKey: "tab-reports",
  },
  {
    id: "reportExported",
    workflow: "exportReport",
    sidebar: "projects",
    label: "Export and save history",
    description:
      "Export a polished PDF and keep the report available in project and client history.",
    targetKey: "export-pdf-button",
  },
];

export function LandingProductTour() {
  const [activeActionId, setActiveActionId] = useState<ScreenId>("dashboard");
  const [pointerActionId, setPointerActionId] = useState<ScreenId>("dashboard");
  const [isClicking, setIsClicking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pointerPosition, setPointerPosition] = useState({
    left: "50%",
    top: "50%",
    visible: false,
  });
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
      activeAction.workflow === "manageProject" ||
        activeAction.workflow === "frameworks"
        ? 2500
        : 3200,
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
          See the AuditFlow workflow in action.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Follow the current AuditFlow workflow from portfolio analytics to
          client workspaces, reusable frameworks, findings, evidence, journeys,
          recommendations, and report history.
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

        <div
          ref={tourFrameRef}
          className="relative grid h-[660px] grid-cols-[240px_minmax(0,1fr)] overflow-hidden bg-slate-100"
        >
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
    { id: "clients" as const, label: "Clients", icon: Building2 },
    { id: "reports" as const, label: "Reports", icon: FileText },
    {
      id: "recommendations" as const,
      label: "Recommendations",
      icon: Lightbulb,
    },
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
        <SidebarUtility icon={LifeBuoy} label="Help" />

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
                jamie.l.robinson21@gmail.com
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <LogOut size={14} />
            <span className="text-sm">Sign out</span>
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
  if (screen === "clients") return <ClientsScreen />;
  if (screen === "projects" || screen === "projectsForFramework")
    return <ProjectsScreen />;
  if (screen === "createProject" || screen === "createProjectSubmit")
    return <CreateProjectScreen scrolled={screen === "createProjectSubmit"} />;
  if (screen === "frameworks") return <FrameworksScreen />;
  if (screen === "projectOverview")
    return (
      <ProjectOverviewScreen
        projectName="Demo Product Audit"
        projectUrl="demo-product.example"
        existing
      />
    );
  if (screen === "frameworkApplied")
    return (
      <ProjectOverviewScreen
        projectName="Demo Product Audit"
        projectUrl="demo-product.example"
      />
    );
  if (screen === "createdProjectOverview")
    return (
      <ProjectOverviewScreen
        projectName="Demo Product Audit"
        projectUrl="demo-product.example"
      />
    );
  if (screen === "newFinding" || screen === "newFindingSubmit")
    return <NewFindingScreen scrolled={screen === "newFindingSubmit"} />;
  if (screen === "evidence") return <EvidenceScreen />;
  if (screen === "journeys") return <JourneyMapsScreen />;
  if (screen === "recommendations") return <RecommendationLibraryScreen />;
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
            You have 4 projects, 16 findings, 11 recommendations, and 13 open
            findings.
          </p>
        </div>
        <span
          data-tour-target="new-project-button"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200"
        >
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
          value="16"
          label="Findings"
          description="Across active audits"
        />
        <DashboardStat
          value="11"
          label="Recommendations"
          description="Ready for review"
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
            name="Demo Product Audit"
            url="demo-product.example"
            type="Ecommerce"
            findings="8"
            status="In Progress"
          />
          <ProjectTableRow
            name="Mobile App Onboarding Audit"
            url="mobileapp.example"
            type="Mobile App"
            findings="5"
            status="In Progress"
          />
          <ProjectTableRow
            name="Pricing Page Conversion Review"
            url="demo-product.example/pricing"
            type="SaaS"
            findings="3"
            status="Completed"
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
          value="16"
          label="Total findings"
          description="Across all projects"
        />
        <DashboardStat
          value="4.0"
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
              title="Demo Product Audit"
              subtitle="8 open findings"
              value="8 findings"
              width="100%"
            />
            <BarRow
              title="Mobile App Onboarding Audit"
              subtitle="5 open findings"
              value="5 findings"
              width="62%"
            />
            <BarRow
              title="Pricing Page Conversion Review"
              subtitle="3 resolved findings"
              value="3 findings"
              width="38%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProjectScreen({ scrolled = false }: { scrolled?: boolean }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={`mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-transform duration-700 ease-in-out ${
          scrolled ? "-translate-y-32" : "translate-y-0"
        }`}
      >
        <FieldBlock label="Start from">
          <SelectBox targetKey="use-framework-button" value="Blank project" />
        </FieldBlock>
        <FieldBlock
          label="Client workspace"
          help="Optional. Connect this project to a Studio client workspace."
        >
          <SelectBox value="No client / personal project" />
        </FieldBlock>
        <FieldBlock label="Project name">
          <InputBox value="e.g. SaaS onboarding audit" muted />
        </FieldBlock>
        <FieldBlock label="Client name" help="Optional">
          <InputBox value="e.g. Acme" muted />
        </FieldBlock>
        <FieldBlock label="Website URL" help="Optional">
          <InputBox value="https://example.com" muted />
        </FieldBlock>
        <FieldBlock label="Audit type">
          <SelectBox value="Onboarding" />
        </FieldBlock>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <span className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm">
            Cancel
          </span>
          <span
            data-tour-target="create-project-submit"
            className="rounded-2xl bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-200"
          >
            Create Project
          </span>
        </div>
      </div>
    </div>
  );
}

function ClientsScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
            Clients
          </h3>
          <p className="mt-3 text-base text-slate-500">
            Manage client workspaces, projects, reports, and brand context in
            one place.
          </p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Client
        </span>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_150px] gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
          <span className="text-lg leading-none">⌕</span>
          <span>Search clients...</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          <span>All Status</span>
          <span className="text-slate-400">⌄</span>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.35fr_0.65fr_0.75fr_0.75fr_0.9fr_0.75fr_32px] bg-slate-50 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Client</span>
          <span>Projects</span>
          <span>Draft Reports</span>
          <span>Open Findings</span>
          <span>Last Activity</span>
          <span>Status</span>
          <span />
        </div>
        <ClientDirectoryRow
          name="Sample Client"
          industry="SaaS"
          projects="2"
          drafts="1"
          findings="12"
          activity="Today"
          status="On Track"
        />
        <ClientDirectoryRow
          name="Cedar & Co."
          industry="Education"
          projects="1"
          drafts="1"
          findings="3"
          activity="Today"
          status="Healthy"
        />
      </div>
    </div>
  );
}

function FrameworksScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
            Frameworks
          </h3>
          <p className="mt-2 text-base text-slate-500">
            Start with a reusable audit methodology or customize your own Studio
            framework.
          </p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Framework
        </span>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <FrameworkCard
          targetKey="framework-card-saas"
          title="Demo Product Audit"
          label="Studio"
          description="Categories, journey stages, recommendations, and report defaults for product onboarding reviews."
          items={["Activation", "Empty states", "Forms", "Trust"]}
        />
        <FrameworkCard
          title="Mobile App Audit"
          label="Built-in"
          description="Review first launch, permissions, navigation, primary task flows, and mobile usability."
          items={["First launch", "Navigation", "Task flow", "Accessibility"]}
        />
        <FrameworkCard
          title="Accessibility Review"
          label="Studio"
          description="A reusable WCAG-focused audit setup with recommendation guidance and report defaults."
          items={["Keyboard", "Contrast", "Labels", "Semantics"]}
        />
        <FrameworkCard
          title="Demo Product Audit"
          label="Built-in"
          description="Review product detail, cart, checkout, trust, error recovery, and purchase confidence."
          items={["Cart", "Payment", "Validation", "Confirmation"]}
        />
      </div>
    </div>
  );
}

function RecommendationLibraryScreen() {
  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
            Recommendation Library
          </h3>
          <p className="mt-3 text-base text-slate-500">
            Save reusable UX recommendations for recurring patterns across client
            work.
          </p>
        </div>
        <span className="mt-24 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Recommendation
        </span>
      </div>

      <div className="mt-8 max-w-[420px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
        <span className="mr-3 text-lg leading-none">⌕</span>
        <span>Search recommendations...</span>
      </div>

      <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.6fr_0.45fr_0.4fr_0.35fr] bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Recommendation</span>
          <span>Category</span>
          <span>Impact</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="grid grid-cols-[1.6fr_0.45fr_0.4fr_0.35fr] items-center gap-4 border-t border-slate-100 px-5 py-5 text-sm">
          <div>
            <p className="font-semibold text-slate-950">Increase visual contrast</p>
            <p className="mt-2 text-slate-500">
              This will ensure that important text won't be missed by users.
            </p>
          </div>
          <span className="text-slate-700">Forms</span>
          <span className="text-slate-700">Medium</span>
          <div className="flex items-center justify-end gap-4">
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm">
              Edit
            </span>
            <span className="text-red-600">Delete</span>
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
          <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
            Projects
          </h3>
          <p className="mt-3 text-base text-slate-500">
            Manage active and archived UX audit projects.
          </p>
        </div>
        <span
          data-tour-target="new-project-button"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200"
        >
          + New Project
        </span>
      </div>

      <div className="mt-8 flex gap-2">
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-100">
          Active
        </span>
        <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
          Archived
        </span>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <ProjectDirectoryRow
          targetKey="project-row-checkout"
          name="Demo Product Audit"
          type="SaaS"
          client="Sample Client"
          url="demo-product.example"
          status="In Progress"
          date="7/2/2026"
        />
        <ProjectDirectoryRow
          name="Demo Mobile App Audit"
          type="Mobile App"
          client="Sample Client"
          url="https://example.com"
          status="Completed"
          date="7/1/2026"
        />
      </div>
    </div>
  );
}

function ProjectOverviewScreen({
  projectName = "Demo Product Audit",
  projectUrl = "demo-product.example",
  existing = false,
}: {
  projectName?: string;
  projectUrl?: string;
  existing?: boolean;
}) {
  return (
    <div className="h-full overflow-hidden">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
            {projectName}
          </h3>
          <p className="mt-3 text-base text-slate-500">{projectUrl}</p>
        </div>
        <div className="flex gap-3">
          <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm">
            Edit Project
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm">
            Archive Project
          </span>
          <span className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm">
            Delete Project
          </span>
        </div>
      </div>

      <ProjectTabs activeTab="overview" />

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <InfoCard label="Audit Type" value="SaaS" />
        <InfoCard label="Status" value="In Progress" />
        <InfoCard label="Client" value="Sample Client" accent />
      </div>

      <div className="mt-8 flex items-end justify-between gap-6">
        <div>
          <h4 className="text-xl font-semibold text-slate-950">Findings</h4>
          <p className="mt-3 text-base text-slate-500">
            Review, prioritize, and annotate issues found during the audit.
          </p>
        </div>
        <span
          data-tour-target="new-finding-button"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200"
        >
          + Add Finding
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_1.25fr] bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Finding</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Recommendation</span>
        </div>
        <FindingSummaryRow
          title="Campaign Manager Page Issue"
          severity="P2"
          recommendation="Use a clearer layout and reduce competing actions..."
        />
        <FindingSummaryRow
          title="Side Navigation Polish"
          severity="P3"
          recommendation="Move overflow controls so navigation stays readable..."
        />
        <FindingSummaryRow
          title="Account Settings Mislabeled"
          severity="P2"
          recommendation="Rename the area so the destination matches user expectations..."
        />
        <FindingSummaryRow
          title="Continue Session UI Polish"
          severity="P3"
          recommendation="Decrease card size and increase hierarchy around the next action."
        />
      </div>
    </div>
  );
}
function NewFindingScreen({ scrolled = false }: { scrolled?: boolean }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={`mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-transform duration-700 ease-in-out ${
          scrolled ? "-translate-y-80" : "translate-y-0"
        }`}
      >
        <FieldBlock label="Finding title">
          <InputBox
            value="Users cannot recover after payment validation fails"
            muted
          />
        </FieldBlock>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldBlock label="Journey" help="Optional">
            <SelectBox value="No journey" />
          </FieldBlock>
          <FieldBlock label="Journey step" help="Optional">
            <SelectBox value="No step" muted />
          </FieldBlock>
        </div>
        <FieldBlock label="Description">
          <div className="mt-2 min-h-[88px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-400">
            What did you observe?
          </div>
        </FieldBlock>

        <div
          data-tour-target="add-evidence-button"
          className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <p className="text-base font-semibold text-slate-950">
            Evidence images
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Upload screenshots or supporting visuals for this finding.
          </p>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-semibold text-slate-900">Image 1</p>
            <div className="mt-4 flex min-h-[132px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 text-center">
              <CloudUpload size={42} strokeWidth={2.25} className="text-violet-600" />
              <p className="mt-3 text-base font-semibold text-slate-950">
                Drag and drop an image here
              </p>
              <p className="mt-1 text-sm text-slate-500">
                or click to browse PNG, JPG, JPEG, or WebP files
              </p>
            </div>
            <FieldBlock label="Evidence name">
              <InputBox value="Product Page Screenshot" muted />
            </FieldBlock>
            <div className="mt-2 min-h-[72px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-400">
              Image caption, e.g. checkout screen showing unclear payment error
            </div>
          </div>

          <span className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            Add another image
          </span>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <span className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm">
            Cancel
          </span>
          <span
            data-tour-target="add-finding-submit"
            className="rounded-2xl bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-200"
          >
            Add Finding
          </span>
        </div>
      </div>
    </div>
  );
}

function EvidenceScreen() {
  return (
    <div className="h-full overflow-hidden">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
              Annotated Evidence
            </h3>
            <p className="mt-3 text-base text-slate-500">
              Add screenshots, then click anywhere on an image to add numbered
              annotations.
            </p>
          </div>
          <span
            data-tour-target="save-finding-button"
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200"
          >
            + Add Evidence
          </span>
        </div>

        <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
            <div>
              <h4 className="text-base font-semibold text-slate-950">
                Product Page Screenshot
              </h4>
              <p className="mt-2 text-sm text-slate-500">1 annotation</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="text-slate-600">Edit</span>
              <span className="text-red-600">Delete</span>
              <span className="text-slate-500">⌄</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="relative mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="relative mx-auto aspect-[16/9] max-w-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <div className="h-3 w-36 rounded-full bg-slate-300" />
                      <div className="mt-3 h-2 w-56 rounded-full bg-slate-200" />
                    </div>
                    <div className="grid h-[calc(100%-56px)] grid-cols-[120px_1fr] gap-4 p-5">
                      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                        <div className="h-3 w-16 rounded-full bg-slate-300" />
                        <div className="h-8 rounded-xl bg-violet-100" />
                        <div className="h-8 rounded-xl bg-slate-200" />
                        <div className="h-8 rounded-xl bg-slate-200" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-10 rounded-2xl bg-slate-100" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 rounded-2xl bg-slate-100" />
                          <div className="h-24 rounded-2xl bg-slate-100" />
                        </div>
                        <div className="h-16 rounded-2xl bg-slate-100" />
                      </div>
                    </div>
                    <div className="absolute right-[30%] top-[28%] flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white shadow-lg">
                      1
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-semibold text-slate-950">
                  Annotations
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Click the screenshot to add a note, or select a marker to
                  review it.
                </p>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
                      1
                    </span>
                    <div>
                      <p className="text-base leading-7 text-slate-700">
                        The key action is competing with secondary content and
                        needs clearer hierarchy.
                      </p>
                      <div className="mt-4 flex gap-4 text-sm font-semibold">
                        <span className="text-violet-700">Edit</span>
                        <span className="text-red-600">Delete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyMapsScreen() {
  return (
    <div className="h-full overflow-hidden">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
            Journeys
          </h3>
          <p className="mt-3 text-base text-slate-500">
            Demo Product Audit
          </p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">
          + New Journey
        </span>
      </div>

      <ProjectTabs activeTab="journeys" />

      <div className="mt-7 space-y-4">
        <JourneyListCard
          title="Landing Page"
          description="Evaluate clarity, trust, CTA hierarchy, and conversion path."
          steps="5 steps"
          findings="1 finding"
        />
        <JourneyListCard
          title="Signup Flow"
          description="Review form friction, account creation, and validation states."
          steps="4 steps"
          findings="2 findings"
        />
        <JourneyListCard
          title="Onboarding"
          description="Evaluate guidance, setup steps, and time to first value."
          steps="4 steps"
          findings="1 finding"
        />
        <JourneyListCard
          title="First Dashboard Experience"
          description="Review empty states, hierarchy, and next-step guidance."
          steps="4 steps"
          findings="1 finding"
        />
        <JourneyListCard
          title="Core Feature Workflow"
          description="Analyze task completion flow and efficiency."
          steps="6 steps"
          findings="3 findings"
        />
      </div>
    </div>
  );
}

function ReportsScreen({ exported = false }: { exported?: boolean }) {
  return (
    <div className="h-full overflow-hidden">
      <div>
        <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
          Reports
        </h3>
        <p className="mt-3 text-base text-slate-500">
          Demo Product Audit
        </p>
      </div>

      <ProjectTabs activeTab="reports" />

      <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-semibold text-slate-950">
              Report builder
            </h4>
            <p className="mt-2 text-base text-slate-500">
              Configure the report, preview it inline, or export a downloadable
              PDF.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm">
              Preview PDF
            </span>
            <span
              data-tour-target="export-pdf-button"
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200"
            >
              Export PDF
            </span>
          </div>
        </div>
      </div>

      {exported && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          Report exported successfully.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <span className="grid h-5 w-5 grid-cols-2 gap-0.5 rounded-sm">
                <span className="col-span-2 rounded-[3px] border-2 border-violet-600" />
                <span className="rounded-[3px] border-2 border-violet-600" />
                <span className="rounded-[3px] border-2 border-violet-600" />
              </span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-slate-950">
                Report template
              </h4>
              <p className="mt-2 text-base text-slate-500">
                Choose the structure that best fits the audience before
                exporting.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <ReportTemplateCard
              active
              title="Professional"
              description="Complete client-ready report with risks, findings, prioritization, recommendations, and appendix."
            />
            <ReportTemplateCard
              title="Executive"
              description="Stakeholder version focused on summary, top risks, prioritization, and decisions."
            />
            <ReportTemplateCard
              title="Minimal"
              description="Lean report with only the essentials."
            />
            <ReportTemplateCard
              title="Findings Only"
              description="Detailed findings, prioritization, and recommendations without broader report narrative."
            />
            <ReportTemplateCard
              title="Evidence Appendix"
              description="Finding evidence and appendix-focused export for documentation review."
            />
            <ReportTemplateCard
              title="Accessibility"
              description="Structured version for accessibility and heuristic review documentation."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-xl font-semibold text-slate-950">
              Audit snapshot
            </h4>
            <div className="mt-5 space-y-4 text-base">
              <SnapshotRow label="Findings" value="17" />
              <SnapshotRow label="Journeys" value="5" />
              <SnapshotRow label="Evidence items" value="17" />
              <SnapshotRow label="Branding" value="Sample Client" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-xl font-semibold text-slate-950">
              Recent exports
            </h4>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">
                Demo Product Audit UX Audit Report
              </p>
              <p className="mt-2 text-sm text-slate-500">
                professional · Jul 1, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportTemplateCard({
  title,
  description,
  active = false,
}: {
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-5 ${
        active
          ? "border-violet-300 bg-violet-50/70 shadow-sm shadow-violet-100"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`absolute right-5 top-5 h-3 w-3 rounded-full border ${
          active
            ? "border-violet-600 bg-violet-600"
            : "border-slate-300 bg-white"
        }`}
      />
      <h5 className="pr-7 text-base font-semibold text-slate-950">{title}</h5>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function ProjectWorkspaceShell({
  activeTab,
  children,
}: {
  activeTab:
    "overview" | "findings" | "journeys" | "recommendations" | "reports";
  children: ReactNode;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "findings" as const, label: "Findings" },
    { id: "journeys" as const, label: "Journey Maps" },
    { id: "recommendations" as const, label: "Recommendations" },
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
  meta,
}: {
  name: string;
  url: string;
  status: string;
  date: string;
  targetKey?: string;
  meta?: string;
}) {
  return (
    <div
      data-tour-target={targetKey}
      className="flex items-center justify-between border-b border-slate-100 px-6 py-5 last:border-b-0"
    >
      <div>
        <p className="text-base font-semibold text-slate-950">{name}</p>
        <p className="mt-1 text-sm text-slate-500">{url}</p>
        {meta && (
          <p className="mt-1 text-xs font-medium text-slate-400">{meta}</p>
        )}
      </div>
      <div className="text-right">
        <StatusPill status={status} />
        <p className="mt-2 text-sm text-slate-400">{date}</p>
      </div>
    </div>
  );
}

function ClientTableRow({
  name,
  url,
  status,
  projects,
  reports,
  health,
}: {
  name: string;
  url: string;
  status: string;
  projects: string;
  reports: string;
  health: string;
}) {
  return (
    <div className="grid grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr_0.8fr] items-center border-b border-slate-100 px-6 py-4 text-sm last:border-b-0">
      <div>
        <p className="font-semibold text-slate-950">{name}</p>
        <p className="mt-1 text-xs text-slate-500">{url}</p>
      </div>
      <StatusPill status={status} />
      <p className="font-semibold text-slate-700">{projects}</p>
      <p className="font-semibold text-slate-700">{reports}</p>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-xs font-semibold text-green-700">
        {health}
      </span>
    </div>
  );
}

function ClientDirectoryRow({
  name,
  industry,
  projects,
  drafts,
  findings,
  activity,
  status,
}: {
  name: string;
  industry: string;
  projects: string;
  drafts: string;
  findings: string;
  activity: string;
  status: "On Track" | "Healthy";
}) {
  return (
    <div className="grid grid-cols-[1.35fr_0.65fr_0.75fr_0.75fr_0.9fr_0.75fr_32px] items-center border-b border-slate-100 px-6 py-4 text-sm last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-950">{name}</p>
          <p className="mt-1 text-xs text-slate-500">{industry}</p>
        </div>
      </div>
      <div>
        <p className="font-semibold text-slate-900">{projects}</p>
        <p className="mt-1 text-xs text-slate-500">Active</p>
      </div>
      <p className="font-semibold text-slate-900">{drafts}</p>
      <p className="font-semibold text-slate-900">{findings}</p>
      <div>
        <p className="font-semibold text-slate-900">{activity}</p>
        <p className="mt-1 text-xs text-slate-500">Findings open</p>
      </div>
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${status === "Healthy" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
      >
        {status}
      </span>
      <span className="text-lg font-semibold text-slate-400">⋮</span>
    </div>
  );
}

function ProjectDirectoryRow({
  name,
  type,
  client,
  url,
  status,
  date,
  targetKey,
}: {
  name: string;
  type: string;
  client: string;
  url: string;
  status: string;
  date: string;
  targetKey?: string;
}) {
  return (
    <div
      data-tour-target={targetKey}
      className="flex items-center justify-between border-b border-slate-100 px-6 py-6 last:border-b-0"
    >
      <div>
        <p className="text-base font-semibold text-slate-950">{name}</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {type}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {client}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-500">{url}</p>
      </div>
      <div className="text-right">
        <StatusPill status={status} />
        <p className="mt-3 text-sm text-slate-400">{date}</p>
      </div>
    </div>
  );
}

function ProjectTabs({
  activeTab,
}: {
  activeTab: "overview" | "journeys" | "reports";
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "journeys" as const, label: "Journeys" },
    { id: "reports" as const, label: "Reports" },
  ];
  return (
    <div className="mt-8 flex gap-8 border-b border-slate-200 pb-5 text-sm font-semibold">
      {tabs.map((tab) => (
        <span
          key={tab.id}
          data-tour-target={`tab-${tab.id}`}
          className={
            activeTab === tab.id ? "text-violet-700" : "text-slate-500"
          }
        >
          {tab.label}
        </span>
      ))}
    </div>
  );
}

function InfoCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-4 text-base font-semibold ${accent ? "text-violet-700" : "text-slate-950"}`}
      >
        {value}
      </p>
    </div>
  );
}

function FindingSummaryRow({
  title,
  severity,
  recommendation,
}: {
  title: string;
  severity: "P2" | "P3";
  recommendation: string;
}) {
  return (
    <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_1.25fr] items-center border-b border-slate-100 px-5 py-4 text-sm last:border-b-0">
      <p className="font-semibold text-slate-950">{title}</p>
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${severity === "P2" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}
      >
        {severity}
      </span>
      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Open
      </span>
      <p className="truncate text-slate-600">{recommendation}</p>
    </div>
  );
}

function FieldBlock({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
      {children}
    </div>
  );
}

function InputBox({
  value,
  muted = false,
}: {
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm ${muted ? "text-slate-400" : "text-slate-900"}`}
    >
      {value}
    </div>
  );
}

function SelectBox({
  value,
  targetKey,
  muted = false,
}: {
  value: string;
  targetKey?: string;
  muted?: boolean;
}) {
  return (
    <div
      data-tour-target={targetKey}
      className={`mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm ${muted ? "text-slate-400" : "text-slate-900"}`}
    >
      <span>{value}</span>
      <span className="text-slate-400">⌄</span>
    </div>
  );
}

function JourneyListCard({
  title,
  description,
  steps,
  findings,
}: {
  title: string;
  description: string;
  steps: string;
  findings: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div>
        <p className="text-lg font-semibold text-slate-950">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex gap-4 text-sm font-medium text-slate-500">
        <span>{steps}</span>
        <span>{findings}</span>
      </div>
    </div>
  );
}

function FrameworkCard({
  title,
  label,
  description,
  items,
  targetKey,
}: {
  title: string;
  label: string;
  description: string;
  items: string[];
  targetKey?: string;
}) {
  return (
    <div
      data-tour-target={targetKey}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            {label}
          </p>
          <h4 className="mt-3 text-xl font-semibold text-slate-950">{title}</h4>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          Use
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Includes
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
          {items.map((item) => (
            <p key={item}>• {item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  title,
  category,
  used,
}: {
  title: string;
  category: string;
  used: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-slate-950">{title}</h4>
          <p className="mt-2 text-sm text-slate-500">{used}</p>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          {category}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Reusable guidance that can be inserted into finding recommendations.
      </p>
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
  const tone =
    status === "Completed" || status === "Ready"
      ? "bg-green-100 text-green-700"
      : status === "Archived"
        ? "bg-slate-100 text-slate-600"
        : "bg-blue-100 text-blue-700";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
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
