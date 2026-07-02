export type LinkedRecommendation = {
  id: string;
  title: string | null;
  recommendation: string | null;
  category: string | null;
  impact: string | null;
};

export type RecommendationSource = "library" | "framework" | string | null | undefined;

type RecommendationMaps = {
  savedRecommendations: Map<string, LinkedRecommendation>;
  frameworkRecommendations: Map<string, LinkedRecommendation>;
};

const SAVED_ID_KEYS = [
  "saved_recommendation_id",
  "studio_recommendation_id",
  "recommendation_id",
  "linked_recommendation_id",
  "selected_recommendation_id",
];

const FRAMEWORK_ID_KEYS = [
  "framework_recommendation_id",
  "studio_framework_recommendation_id",
  "recommendation_id",
  "linked_recommendation_id",
  "selected_recommendation_id",
];

export function normalizeRecommendationId(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const prefixedMatch = trimmed.match(/^(library|saved|studio|framework):(.+)$/i);
  if (prefixedMatch?.[2]) {
    return prefixedMatch[2].trim() || null;
  }

  return trimmed;
}

export function uniqueRecommendationIds(values: unknown[]): string[] {
  return Array.from(
    new Set(values.map((value) => normalizeRecommendationId(value)).filter((value): value is string => Boolean(value)))
  );
}

export function uniqueRecommendationIdsFromFindings(findings: any[] | null | undefined, source: "library" | "framework"): string[] {
  const keys = source === "framework" ? FRAMEWORK_ID_KEYS : SAVED_ID_KEYS;
  const values: unknown[] = [];

  for (const finding of findings ?? []) {
    for (const key of keys) values.push(finding?.[key]);

    if (source === "library") {
      values.push(finding?.linked_recommendation?.id);
      values.push(finding?.saved_recommendation?.id);
      values.push(finding?.studio_recommendation?.id);
    } else {
      values.push(finding?.linked_framework_recommendation?.id);
      values.push(finding?.framework_recommendation?.id);
      values.push(finding?.studio_framework_recommendation?.id);
    }
  }

  return uniqueRecommendationIds(values);
}

export function normalizeRecommendationSource(value: RecommendationSource): "library" | "framework" | null {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === "framework") return "framework";
  if (normalized === "library" || normalized === "saved" || normalized === "studio") return "library";
  return null;
}

export function buildRecommendationMap(items: LinkedRecommendation[] | null | undefined, source: "library" | "framework") {
  const map = new Map<string, LinkedRecommendation>();
  const prefixes = source === "framework" ? ["framework"] : ["library", "saved", "studio"];

  for (const item of items ?? []) {
    const id = normalizeRecommendationId(item?.id);
    if (!id) continue;

    map.set(id, item);
    for (const prefix of prefixes) {
      map.set(`${prefix}:${id}`, item);
    }
  }

  return map;
}

function getCandidateIds(finding: any, source: "library" | "framework") {
  const keys = source === "framework" ? FRAMEWORK_ID_KEYS : SAVED_ID_KEYS;
  const candidates: string[] = [];

  for (const key of keys) {
    const raw = finding?.[key];
    if (typeof raw === "string" && raw.trim()) {
      candidates.push(raw.trim());
      const normalized = normalizeRecommendationId(raw);
      if (normalized) candidates.push(normalized);
    }
  }

  const nested = source === "framework"
    ? [finding?.linked_framework_recommendation, finding?.framework_recommendation, finding?.studio_framework_recommendation]
    : [finding?.linked_recommendation, finding?.saved_recommendation, finding?.studio_recommendation];

  for (const item of nested) {
    if (typeof item?.id === "string") {
      candidates.push(item.id);
      const normalized = normalizeRecommendationId(item.id);
      if (normalized) candidates.push(normalized);
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

function getNestedRecommendation(finding: any, source: "library" | "framework"): LinkedRecommendation | undefined {
  const nested = source === "framework"
    ? [finding?.linked_framework_recommendation, finding?.framework_recommendation, finding?.studio_framework_recommendation]
    : [finding?.linked_recommendation, finding?.saved_recommendation, finding?.studio_recommendation];

  return nested.find((item) => item?.recommendation || item?.title);
}

function findInMap(ids: string[], map: Map<string, LinkedRecommendation>) {
  for (const id of ids) {
    const direct = map.get(id);
    if (direct) return direct;

    const normalized = normalizeRecommendationId(id);
    if (normalized) {
      const normalizedMatch = map.get(normalized);
      if (normalizedMatch) return normalizedMatch;
    }
  }

  return undefined;
}

export function resolveLinkedRecommendation({
  finding,
  savedRecommendations,
  frameworkRecommendations,
}: {
  finding: any;
  savedRecommendations: Map<string, LinkedRecommendation>;
  frameworkRecommendations: Map<string, LinkedRecommendation>;
}): LinkedRecommendation | undefined {
  const savedIds = getCandidateIds(finding, "library");
  const frameworkIds = getCandidateIds(finding, "framework");

  const saved = findInMap(savedIds, savedRecommendations) ?? getNestedRecommendation(finding, "library");
  const framework = findInMap(frameworkIds, frameworkRecommendations) ?? getNestedRecommendation(finding, "framework");
  const source = normalizeRecommendationSource(finding?.recommendation_source);

  if (source === "framework") return framework ?? saved;
  if (source === "library") return saved ?? framework;

  return saved ?? framework;
}

export function hydrateFindingRecommendation({
  finding,
  savedRecommendations,
  frameworkRecommendations,
}: {
  finding: any;
  savedRecommendations: Map<string, LinkedRecommendation>;
  frameworkRecommendations: Map<string, LinkedRecommendation>;
}) {
  const linkedRecommendation = resolveLinkedRecommendation({
    finding,
    savedRecommendations,
    frameworkRecommendations,
  });

  const directRecommendation =
    typeof finding?.recommendation === "string" && finding.recommendation.trim().length > 0
      ? finding.recommendation
      : null;

  const linkedRecommendationText =
    typeof linkedRecommendation?.recommendation === "string" && linkedRecommendation.recommendation.trim().length > 0
      ? linkedRecommendation.recommendation
      : null;

  return {
    ...finding,
    saved_recommendation_id: normalizeRecommendationId(finding?.saved_recommendation_id),
    framework_recommendation_id: normalizeRecommendationId(finding?.framework_recommendation_id),
    recommendation_source: normalizeRecommendationSource(finding?.recommendation_source) ?? finding?.recommendation_source ?? null,
    recommendation: directRecommendation ?? linkedRecommendationText ?? null,
    linked_recommendation: linkedRecommendation ?? finding?.linked_recommendation ?? null,
    linked_recommendation_text: linkedRecommendationText,
    category: finding?.category ?? linkedRecommendation?.category ?? null,
    impact: finding?.impact ?? linkedRecommendation?.impact ?? null,
    linked_recommendation_title: linkedRecommendation?.title ?? null,
  };
}

export function getFindingRecommendationText(finding: any): string | null {
  const candidates = [
    finding?.recommendation,
    finding?.linked_recommendation_text,
    finding?.linked_recommendation?.recommendation,
    finding?.saved_recommendation?.recommendation,
    finding?.studio_recommendation?.recommendation,
    finding?.framework_recommendation?.recommendation,
    finding?.studio_framework_recommendation?.recommendation,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return null;
}


export function getFindingRecommendationReportText(finding: any): string | null {
  return getFindingRecommendationText(finding);
}
