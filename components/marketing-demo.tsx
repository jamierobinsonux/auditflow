"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  Download,
  FileText,
  FolderKanban,
  GitBranch,
  Lightbulb,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";

type SceneId =
  | "landing"
  | "dashboard"
  | "createProject"
  | "findings"
  | "journeys"
  | "recommendations"
  | "reports"
  | "portal"
  | "ending";

type Scene = {
  id: SceneId;
  eyebrow: string;
  title: string;
  description: string;
  duration: number;
  targetKey: string;
  zoom?: string;
  script: string;
};

const scenes: Scene[] = [
  {
    id: "landing",
    eyebrow: "0:00 — Welcome to AuditFlow",
    title: "UX audits deserve a better workflow.",
    description: "Professional UX audits, simplified.",
    duration: 5200,
    targetKey: "landing-primary-cta",
    zoom: "scale-[1.01]",
    script:
      "UX audits shouldn’t live in spreadsheets, screenshots, and scattered documents.",
  },
  {
    id: "dashboard",
    eyebrow: "0:05 — Your Audit Workspace",
    title: "One place for the full audit lifecycle.",
    description: "Manage every audit in one place.",
    duration: 6200,
    targetKey: "dashboard-new-project",
    zoom: "scale-[1.015]",
    script:
      "AuditFlow brings your entire UX audit workflow into one focused workspace.",
  },
  {
    id: "createProject",
    eyebrow: "0:11 — Create Your Project",
    title: "Create a project in seconds.",
    description: "Start every engagement with a clear project workspace.",
    duration: 6500,
    targetKey: "create-project-submit",
    zoom: "scale-[1.02]",
    script:
      "Create a project in seconds and start documenting issues immediately.",
  },
  {
    id: "findings",
    eyebrow: "0:18 — Capture Findings",
    title: "Capture, search, sort, and prioritize.",
    description: "Capture, prioritize, and organize issues.",
    duration: 7800,
    targetKey: "finding-sort",
    zoom: "scale-[1.02]",
    script:
      "Capture findings, prioritize by severity, and keep every recommendation organized.",
  },
  {
    id: "journeys",
    eyebrow: "0:26 — Map the User Journey",
    title: "Connect findings to the user journey.",
    description: "Connect each finding to the user experience.",
    duration: 6400,
    targetKey: "journey-step-checkout",
    zoom: "scale-[1.015]",
    script:
      "Map issues directly to user journeys so every recommendation has context.",
  },
  {
    id: "recommendations",
    eyebrow: "0:32 — Build Better Recommendations",
    title: "Reuse your best advice.",
    description: "Reuse your best recommendations.",
    duration: 5600,
    targetKey: "recommendation-search",
    zoom: "scale-[1.015]",
    script:
      "Save your best recommendations and reuse them across future audits.",
  },
  {
    id: "reports",
    eyebrow: "0:38 — Generate Professional Reports",
    title: "Generate client-ready reports.",
    description: "Generate professional reports in minutes.",
    duration: 7000,
    targetKey: "export-pdf",
    zoom: "scale-[1.02]",
    script:
      "Generate polished, client-ready reports with just a few clicks.",
  },
  {
    id: "portal",
    eyebrow: "0:45 — Collaborate with Clients",
    title: "Collaborate without losing context.",
    description: "Collaborate directly with clients.",
    duration: 6800,
    targetKey: "portal-notification",
    zoom: "scale-[1.015]",
    script:
      "Share your work, collaborate with clients, and keep every conversation in one place.",
  },
  {
    id: "ending",
    eyebrow: "0:53 — From Insight to Action",
    title: "Professional UX audits, simplified.",
    description: "From insight to action.",
    duration: 5200,
    targetKey: "ending-logo",
    zoom: "scale-100",
    script:
      "Spend less time managing audits and more time improving products. AuditFlow. Professional UX audits, simplified. From insight to action.",
  },
];

export const marketingVoiceoverScript = scenes.map((scene) => scene.script);

export function MarketingDemo() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({
    left: "50%",
    top: "50%",
    visible: false,
  });
  const demoFrameRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  const scene = scenes[sceneIndex];
  const progress = Math.round(((sceneIndex + 1) / scenes.length) * 100);

  const updatePointerPosition = useCallback(() => {
    const frame = demoFrameRef.current;
    if (!frame) return;

    const target = frame.querySelector<HTMLElement>(
      `[data-demo-target="${scene.targetKey}"]`,
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
  }, [scene.targetKey]);

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }

  function jumpToScene(index: number, play = false) {
    clearTimers();
    setSceneIndex(index);
    setIsPlaying(play);
    setIsClicking(false);

    timers.current.push(
      window.setTimeout(() => setIsClicking(true), 720),
      window.setTimeout(() => setIsClicking(false), 920),
    );
  }

  useEffect(() => {
    updatePointerPosition();
    const raf = window.requestAnimationFrame(updatePointerPosition);
    window.addEventListener("resize", updatePointerPosition);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePointerPosition);
    };
  }, [sceneIndex, updatePointerPosition]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      jumpToScene((sceneIndex + 1) % scenes.length, true);
    }, scene.duration);
    return () => window.clearTimeout(timer);
  }, [isPlaying, scene.duration, sceneIndex]);

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (!isRecordingMode) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsRecordingMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecordingMode]);

  const script = useMemo(() => scenes.map((item) => item.script).join("\n\n"), []);

  return (
    <div className={`min-h-screen bg-slate-950 text-white ${isRecordingMode ? "p-0" : "px-4 py-6 sm:px-6 lg:px-8"}`}>
      {!isRecordingMode ? (
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              AuditFlow marketing demo
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              60-second product video sequence
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRecordingMode(true)}
              className="rounded-xl border border-violet-300/40 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-500/25"
            >
              Recording Mode
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => jumpToScene(0, true)}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
            >
              Restart
            </button>
          </div>
        </div>
      ) : null}

      <div className={isRecordingMode ? "mx-auto h-screen w-screen bg-slate-950" : "mx-auto max-w-[1500px] space-y-6"}>
        <div className={`overflow-hidden border border-white/10 bg-slate-900 shadow-2xl shadow-violet-950/40 ${isRecordingMode ? "h-screen rounded-none border-0" : "rounded-[2rem]"}`}>
          {!isRecordingMode ? (
            <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-slate-950/70 px-5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-4 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-300">
                auditflowapp.co/marketing-demo
              </span>
              <span className="ml-auto text-xs font-semibold text-violet-200">
                {progress}%
              </span>
            </div>
          ) : null}

          <div
            ref={demoFrameRef}
            className={`relative overflow-hidden bg-slate-100 ${isRecordingMode ? "h-screen" : "aspect-video min-h-[520px]"}`}
          >
            <div
              key={scene.id}
              className={`h-full origin-center transition-all duration-700 ease-out ${scene.zoom ?? "scale-100"}`}
            >
              <MarketingScreen scene={scene.id} />
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/30 to-transparent" />
            <MovingClickDot
              left={pointerPosition.left}
              top={pointerPosition.top}
              visible={pointerPosition.visible}
              isClicking={isClicking}
            />
            <div
              key={`caption-${scene.id}`}
              className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl shadow-slate-900/10 backdrop-blur transition-all duration-500 md:left-auto md:max-w-[460px]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                {scene.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {scene.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {scene.description}
              </p>
            </div>

          </div>
        </div>

        {!isRecordingMode ? (
          <>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 text-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {scenes.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToScene(index, false)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      index === sceneIndex
                        ? "border-violet-300 bg-violet-500 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                    }`}
                  >
                    {item.title.replace(".", "")}
                  </button>
                ))}
              </div>
            </div>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] text-slate-200">
              <button
                type="button"
                onClick={() => setIsScriptOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                    Voiceover script
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Use this while recording, then enable Recording Mode for a clean capture.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                  {isScriptOpen ? "Hide" : "Show"}
                </span>
              </button>

              {isScriptOpen ? (
                <div className="border-t border-white/10 p-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {scenes.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => jumpToScene(index, false)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          index === sceneIndex
                            ? "border-violet-400 bg-violet-500/15 text-white"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                        }`}
                      >
                        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                          {item.eyebrow}
                        </span>
                        <span className="mt-2 block text-sm leading-6">“{item.script}”</span>
                      </button>
                    ))}
                  </div>

                  <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Full script
                  </label>
                  <textarea
                    readOnly
                    value={script}
                    className="mt-2 h-44 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs leading-5 text-slate-300 outline-none"
                  />
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function MarketingLogo({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/AFLogo.png"
      alt="AuditFlow"
      className="h-auto shrink-0"
      style={{ width: size }}
    />
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

function MarketingScreen({ scene }: { scene: SceneId }) {
  if (scene === "landing") return <LandingShot />;
  if (scene === "dashboard") return <DashboardShot />;
  if (scene === "createProject") return <CreateProjectShot />;
  if (scene === "findings") return <FindingsShot />;
  if (scene === "journeys") return <JourneysShot />;
  if (scene === "recommendations") return <RecommendationsShot />;
  if (scene === "reports") return <ReportsShot />;
  if (scene === "portal") return <PortalShot />;
  return <EndingShot />;
}

function AppChrome({ children, active = "Dashboard" }: { children: ReactNode; active?: string }) {
  const workspaceNav = ["Dashboard", "Analytics"];
  const auditNav = ["Projects", "Clients", "Reports", "Recommendations", "Frameworks"];

  return (
    <div className="grid h-full grid-cols-[255px_minmax(0,1fr)] bg-[#F1F5F9] text-slate-950">
      <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <MarketingLogo size={25} />
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">AuditFlow</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">UX Audit Platform</p>
          </div>
        </div>
        <div className="flex-1 space-y-6 px-4 py-5">
          <NavGroup title="Workspace" items={workspaceNav} active={active} />
          <NavGroup title="Audits" items={auditNav} active={active} />
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">JR</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">Jamie Robinson</p>
                <p className="truncate text-xs text-slate-500">jamie@auditflowapp.co</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">Sign out</p>
          </div>
        </div>
      </aside>
      <section className="min-w-0 overflow-hidden">
        <div className="flex h-[70px] items-center justify-end border-b border-slate-200 bg-[#F8FAFC] px-7">
          <span className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
            <Bell size={19} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-[10px] font-bold text-white">5</span>
          </span>
        </div>
        <main className="h-[calc(100%-70px)] overflow-hidden px-8 py-7">{children}</main>
      </section>
    </div>
  );
}

function NavGroup({ title, items, active }: { title: string; items: string[]; active: string }) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold ${
              item === active ? "bg-violet-50 text-violet-700" : "text-slate-600"
            }`}
          >
            <span>{item}</span>

          </div>
        ))}
      </div>
    </div>
  );
}

function LandingShot() {
  return (
    <div className="flex h-full flex-col bg-white px-10 py-8 text-slate-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MarketingLogo size={28} />
          <div>
            <p className="text-xl font-semibold tracking-[-0.04em]">AuditFlow</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">UX Audit Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
          <span>Sign in</span>
          <span data-demo-target="landing-primary-cta" className="rounded-xl bg-violet-600 px-5 py-3 text-white shadow-lg shadow-violet-200">Start free</span>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ede9fe,transparent_42%)]" />
        <div className="relative max-w-4xl">
          <p className="mx-auto inline-flex rounded-full border border-violet-100 bg-violet-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
            UX Audit Platform
          </p>
          <h2 className="mt-8 text-6xl font-semibold leading-[1.02] tracking-[-0.06em]">
            Organize UX audits from insight to action.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Capture findings, connect evidence, map journeys, prioritize issues, and create stakeholder-ready reports from one focused workspace.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <span className="rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200">Start free</span>
            <span className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700">See the workflow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardShot() {
  return (
    <AppChrome active="Dashboard">
      <Header title="Welcome, Jamie Robinson" subtitle="A quick snapshot of your current audit workload." action="+ New Project" actionTarget="dashboard-new-project" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stat value="4" label="Projects" caption="Active audits" />
        <Stat value="27" label="Findings" caption="Open issues" />
        <Stat value="8" label="Reports" caption="Generated deliverables" />
        <Stat value="3" label="Clients" caption="Client workspaces" />
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <TableCard title="Recent projects">
          <ProjectListRow title="Nova Commerce Checkout" url="novacommerce.example" type="Ecommerce" status="In Progress" />
          <ProjectListRow title="BrightPath Learning Audit" url="brightpath.example" type="SaaS" status="In Review" />
          <ProjectListRow title="Horizon Health Portal" url="horizon.example" type="Healthcare" status="Completed" />
        </TableCard>
        <Card title="Recent activity">
          <ActivityRow title="Primary CTA lacks contrast" meta="Finding updated · Nova Commerce" />
          <ActivityRow title="Professional report exported" meta="Report generated · BrightPath" />
          <ActivityRow title="Client reply received" meta="Portal comment · Horizon Health" />
        </Card>
      </div>
    </AppChrome>
  );
}

function CreateProjectShot() {
  return (
    <AppChrome active="Projects">
      <Header title="New Project" subtitle="Create a blank UX audit project or start from a reusable framework. Client workspaces are optional." />
      <div className="mx-auto mt-6 max-w-[690px] rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <Field label="Start from" value="Blank project" select />
        <Field label="Client workspace" helper="Optional. Connect this project to a client workspace." value="Nova Commerce" select />
        <Field label="Project name" value="Nova Commerce Checkout" active />
        <Field label="Client name" helper="Optional" value="Nova Commerce" />
        <Field label="Website URL" helper="Optional" value="https://novacommerce.example" />
        <Field label="Audit type" value="Ecommerce" select />
        <div className="mt-7 grid grid-cols-2 gap-3">
          <span className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700">Cancel</span>
          <span data-demo-target="create-project-submit" className="rounded-2xl bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-200">Create Project</span>
        </div>
      </div>
    </AppChrome>
  );
}

function FindingsShot() {
  return (
    <AppChrome active="Projects">
      <ProjectHeader title="Nova Commerce Checkout" url="novacommerce.example" />
      <div className="mt-5 grid grid-cols-3 gap-4">
        <SummaryCard label="Audit Type" value="Ecommerce" />
        <SummaryCard label="Status" value="In Progress" />
        <SummaryCard label="Client" value="Nova Commerce" purple />
      </div>
      <div className="mt-6 flex items-start justify-between gap-5">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Findings</h3>
          <p className="mt-1 text-sm text-slate-500">Review, prioritize, and annotate issues found during the audit.</p>
        </div>
        <span className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">+ Add Finding</span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_190px] gap-4">
        <SearchPill text="Search findings..." />
        <SelectPill text="Newest first" target="finding-sort" />
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <TableHeader cols="grid-cols-[1.15fr_0.45fr_0.55fr_0.95fr]" items={["Finding", "Severity", "Status", "Recommendation"]} />
        <FindingRow title="Primary CTA lacks contrast" severity="P1" status="Open" rec="Increase CTA contrast and simplify nearby actions" />
        <FindingRow title="Checkout validation is unclear" severity="P2" status="In Review" rec="Improve error messaging near each field" />
        <FindingRow title="Confirmation feedback is easy to miss" severity="P2" status="Open" rec="Add persistent success state" />
      </div>
    </AppChrome>
  );
}

function JourneysShot() {
  return (
    <AppChrome active="Projects">
      <Header title="Journeys" subtitle="Nova Commerce Checkout" action="+ New Journey" />
      <TabBar active="Journeys" />
      <div className="mt-6 space-y-4">
        <JourneyListItem title="Landing Page" description="Evaluate clarity, trust, CTA hierarchy, and conversion path." meta="5 steps · 2 findings" />
        <JourneyListItem title="Product Discovery" description="Review filters, search, category browsing, and product comparison." meta="4 steps · 3 findings" />
        <JourneyListItem title="Checkout" description="Review cart review, form validation, payment, and confirmation states." meta="5 steps · 5 findings" target="journey-step-checkout" />
        <JourneyListItem title="Account Creation" description="Evaluate signup friction, validation, and onboarding handoff." meta="4 steps · 1 finding" />
      </div>
    </AppChrome>
  );
}

function RecommendationsShot() {
  return (
    <AppChrome active="Recommendations">
      <Header title="Recommendation Library" subtitle="Save reusable UX recommendations for recurring patterns across client work." action="+ New Recommendation" />
      <div className="mt-6 max-w-md"><SearchPill text="Search recommendations..." target="recommendation-search" /></div>
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <TableHeader cols="grid-cols-[1.45fr_0.55fr_0.45fr_0.45fr]" items={["Recommendation", "Category", "Impact", "Actions"]} />
        <RecommendationRow title="Increase visual contrast" desc="This will ensure that important text won't be missed by users." category="Visual Design" impact="High" />
        <RecommendationRow title="Improve form validation" desc="Show field-level errors with recovery guidance." category="Forms" impact="High" />
      </div>
    </AppChrome>
  );
}

function ReportsShot() {
  return (
    <AppChrome active="Projects">
      <ProjectHeader title="Nova Commerce Checkout" url="novacommerce.example" activeTab="Reports" tabTarget="reports-tab" />
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-950">Report builder</h3>
            <p className="mt-1 text-sm text-slate-500">Configure the report, preview it inline, or export a downloadable PDF.</p>
          </div>
          <div className="flex gap-3">
            <span data-demo-target="preview-pdf" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Preview PDF</span>
            <span data-demo-target="export-pdf" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"><Download size={16} /> Export PDF</span>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.72fr]">
        <Card title="Report template">
          <div className="grid grid-cols-2 gap-3">
            <ReportOption title="Professional" active />
            <ReportOption title="Executive" />
            <ReportOption title="Minimal" />
            <ReportOption title="Findings Only" />
          </div>
        </Card>
        <div className="space-y-5">
          <Card title="Audit snapshot">
            <SnapshotLine label="Findings" value="12" />
            <SnapshotLine label="Journeys" value="4" />
            <SnapshotLine label="Evidence items" value="6" />
            <SnapshotLine label="Branding" value="Nova Commerce" />
          </Card>
          <Card title="Recent exports">
            <MiniProject title="Nova Commerce UX Audit Report" meta="professional · Jul 7, 2026" />
          </Card>
        </div>
      </div>
    </AppChrome>
  );
}

function PortalShot() {
  return (
    <div className="h-full overflow-hidden bg-[#F1F5F9] p-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <MarketingLogo size={28} />
            <div>
              <p className="text-lg font-semibold tracking-[-0.04em] text-slate-950">Nova Commerce Portal</p>
              <p className="text-sm text-slate-500">Reports, findings, and replies in one place.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"><Bell size={16} /> 2 updates</span>
        </div>
        <Card title="Projects">
          <PortalProject title="Nova Commerce Checkout" type="Ecommerce" status="In Progress" />
          <PortalProject title="Nova Commerce Mobile Audit" type="Mobile App" status="Completed" />
        </Card>
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card title="Notifications">
            <Notification text="Jamie Robinson replied on Confirmation feedback is easy to miss" target="portal-notification" />
            <Notification text="Jamie Robinson replied on Checkout validation is unclear" />
          </Card>
          <Card title="Reports">
            <MiniProject title="Nova Commerce UX Audit Report" meta="Professional · Download anytime" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function EndingShot() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-950 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4c1d95,transparent_46%)] opacity-70" />
      <div className="relative">
        <div data-demo-target="ending-logo" className="inline-flex rounded-3xl bg-white p-5"><MarketingLogo size={34} /></div>
        <h2 className="mt-8 text-6xl font-semibold tracking-[-0.06em]">From insight to action.</h2>
        <p className="mt-5 text-lg text-violet-100">Professional UX audits, simplified.</p>
      </div>
    </div>
  );
}

function Header({ title, subtitle, action, actionTarget }: { title: string; subtitle: string; action?: string; actionTarget?: string }) {
  return <div className="flex items-start justify-between gap-6"><div><h2 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">{title}</h2><p className="mt-2 text-base text-slate-500">{subtitle}</p></div>{action ? <span data-demo-target={actionTarget} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200">{action}</span> : null}</div>;
}
function ProjectHeader({ title, url, activeTab = "Overview", tabTarget }: { title: string; url: string; activeTab?: string; tabTarget?: string }) { return <><div className="flex items-start justify-between gap-6"><div><h2 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">{title}</h2><p className="mt-2 text-base text-slate-500">{url}</p></div><div className="flex gap-3"><span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">Edit Project</span><span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">Archive Project</span></div></div><TabBar active={activeTab} target={tabTarget} /></>; }
function TabBar({ active, target }: { active: string; target?: string }) { return <div className="mt-5 flex gap-8 border-b border-slate-200 text-sm font-semibold"><span className={active === "Overview" ? "pb-4 text-violet-700" : "pb-4 text-slate-500"}>Overview</span><span className={active === "Journeys" ? "pb-4 text-violet-700" : "pb-4 text-slate-500"}>Journeys</span><span data-demo-target={target} className={active === "Reports" ? "pb-4 text-violet-700" : "pb-4 text-slate-500"}>Reports</span></div>; }
function Stat({ value, label, caption }: { value: string; label: string; caption?: string }) { return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-3xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm font-semibold text-slate-950">{label}</p>{caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}</div>; }
function SummaryCard({ label, value, purple }: { label: string; value: string; purple?: boolean }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className={`mt-3 text-base font-semibold ${purple ? "text-violet-700" : "text-slate-950"}`}>{value}</p></div>; }
function Card({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-semibold text-slate-950">{title}</h3><div className="mt-4 space-y-3">{children}</div></div>; }
function TableCard({ title, children }: { title: string; children: ReactNode }) { return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><h3 className="px-5 py-4 text-xl font-semibold text-slate-950">{title}</h3><div className="border-t border-slate-100">{children}</div></div>; }
function ProjectListRow({ title, url, type, status }: { title: string; url: string; type: string; status: string }) { return <div className="grid grid-cols-[1fr_0.45fr_0.45fr] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"><div><p className="truncate font-semibold text-slate-950">{title}</p><p className="mt-1 truncate text-sm text-slate-500">{url}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-center text-xs font-semibold text-emerald-700">{type}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-center text-xs font-semibold text-blue-700">{status}</span></div>; }
function MiniProject({ title, meta }: { title: string; meta: string }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="truncate font-semibold text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">{meta}</p></div>; }
function ActivityRow({ title, meta }: { title: string; meta: string }) { return <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="mt-0.5 h-3 w-3 rounded-full bg-violet-500" /><div><p className="font-semibold text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">{meta}</p></div></div>; }
function Field({ label, value, active, select, helper }: { label: string; value: string; active?: boolean; select?: boolean; helper?: string }) { return <div className="mt-4"><p className="mb-1 text-sm font-semibold text-slate-700">{label}</p>{helper ? <p className="mb-2 text-xs text-slate-500">{helper}</p> : null}<div className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${active ? "border-violet-200 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-700"}`}><span>{value}</span>{select ? <span className="pr-1 text-slate-400">⌄</span> : null}</div></div>; }
function SearchPill({ text, target }: { text: string; target?: string }) { return <div data-demo-target={target} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm"><Search size={16} /><span>{text}</span></div>; }
function SelectPill({ text, target }: { text: string; target?: string }) { return <div data-demo-target={target} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-5 text-sm font-semibold text-slate-700 shadow-sm"><span>{text}</span><span className="text-slate-400">⌄</span></div>; }
function TableHeader({ cols, items }: { cols: string; items: string[] }) { return <div className={`grid ${cols} gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500`}>{items.map((item) => <span key={item}>{item}</span>)}</div>; }
function FindingRow({ title, severity, status, rec }: { title: string; severity: string; status: string; rec: string }) { return <div className="grid grid-cols-[1.15fr_0.45fr_0.55fr_0.95fr] items-center gap-4 border-t border-slate-100 px-5 py-4 text-sm"><span className="truncate font-semibold text-slate-950">{title}</span><span className="w-fit rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">{severity}</span><span className="w-fit rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{status}</span><span className="truncate text-slate-500">{rec}</span></div>; }
function JourneyListItem({ title, description, meta, target }: { title: string; description: string; meta: string; target?: string }) { return <div data-demo-target={target} className="flex items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="text-lg font-semibold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div><span className="shrink-0 text-sm font-semibold text-slate-500">{meta}</span></div>; }
function RecommendationRow({ title, desc, category, impact }: { title: string; desc: string; category: string; impact: string }) { return <div className="grid grid-cols-[1.45fr_0.55fr_0.45fr_0.45fr] items-center gap-4 border-t border-slate-100 px-5 py-5 text-sm"><div><p className="truncate font-semibold text-slate-950">{title}</p><p className="mt-1 truncate text-slate-500">{desc}</p></div><span>{category}</span><span>{impact}</span><span className="text-right font-semibold text-violet-700">Edit</span></div>; }
function ReportOption({ title, active }: { title: string; active?: boolean }) { return <div className={`rounded-2xl border p-4 ${active ? "border-violet-200 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white"}`}><p className="font-semibold text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">Client-ready export option</p></div>; }
function SnapshotLine({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-950">{value}</span></div>; }
function PortalProject({ title, type, status }: { title: string; type: string; status: string }) { return <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div><p className="font-semibold text-slate-950">{title}</p><div className="mt-2 flex gap-2"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{type}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{status}</span></div></div><span className="text-xs text-slate-500">Updated Jul 7, 2026</span></div>; }
function Notification({ text, target }: { text: string; target?: string }) { return <div data-demo-target={target} className="rounded-2xl border border-violet-100 bg-violet-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Consultant reply</p><p className="mt-2 text-sm font-semibold text-slate-950">{text}</p><p className="mt-1 text-xs text-slate-500">Nova Commerce · Jul 7, 2026</p></div>; }
