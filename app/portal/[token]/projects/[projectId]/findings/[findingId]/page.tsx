import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card } from "@/components/layout/card";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PortalFindingDetailPage({
  params,
}: {
  params: Promise<{ token: string; projectId: string; findingId: string }>;
}) {
  const { token, projectId, findingId } = await params;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select(
      "id,user_id,name,website_url,industry,brand_color,logo_url,portal_enabled"
    )
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (!client) notFound();

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("id,name,website_url,audit_type,status,client_id,user_id,archived")
    .eq("id", projectId)
    .eq("client_id", client.id)
    .eq("user_id", client.user_id)
    .eq("archived", false)
    .maybeSingle();

  if (!project) notFound();

  const { data: finding } = await supabaseAdmin
    .from("findings")
    .select("*")
    .eq("id", findingId)
    .eq("project_id", project.id)
    .eq("user_id", client.user_id)
    .maybeSingle();

  if (!finding) notFound();

  const [{ data: branding }, { data: images }, { data: annotations }] =
    await Promise.all([
      supabaseAdmin
        .from("client_branding")
        .select("company_name,logo_url,primary_color,secondary_color,footer_text")
        .eq("client_id", client.id)
        .eq("user_id", client.user_id)
        .maybeSingle(),
      supabaseAdmin
        .from("finding_images")
        .select("*")
        .eq("finding_id", finding.id)
        .eq("user_id", client.user_id)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("image_annotations")
        .select("*")
        .eq("finding_id", finding.id)
        .eq("user_id", client.user_id)
        .order("created_at", { ascending: true }),
    ]);

  const linkedRecommendation = await loadLinkedRecommendation({
    userId: client.user_id,
    savedRecommendationId: finding.saved_recommendation_id,
    frameworkRecommendationId: finding.framework_recommendation_id,
  });

  const primaryColor = branding?.primary_color || client.brand_color || "#7C3AED";
  const logoUrl = branding?.logo_url || client.logo_url;
  const clientName = branding?.company_name || client.name;
  const recommendationText =
    finding.recommendation || linkedRecommendation?.recommendation || null;
  const findingCategory = finding.category ?? linkedRecommendation?.category ?? null;
  const findingImpact = finding.impact ?? linkedRecommendation?.impact ?? null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2" style={{ backgroundColor: primaryColor }} />
          <div className="p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-contain p-2"
                  />
                ) : (
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {clientName.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Client Portal
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.035em] text-slate-950">
                    {clientName}
                  </h1>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {project.name}
                  </p>
                </div>
              </div>

              <Button asChild variant="outline">
                <Link href={`/portal/${token}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to portal
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={finding.severity} />
                  <StatusBadge status={finding.status} />
                  {findingCategory && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {findingCategory}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                  {finding.title || "Untitled finding"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Read-only finding detail shared by your consultant.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:min-w-56">
                <Meta label="Impact" value={findingImpact || "—"} />
                <Meta label="Effort" value={finding.effort || "—"} />
              </div>
            </div>
          </Card>
        </section>

        <div className="mt-6 grid gap-6">
          <Card className="p-6">
            <SectionHeader title="Description" />
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {finding.description || "No description was added for this finding."}
            </p>
          </Card>

          <Card className="p-6">
            <SectionHeader title="Recommendation" />
            {linkedRecommendation?.title && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-violet-600">
                Linked recommendation: {linkedRecommendation.title}
              </p>
            )}
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {recommendationText || "No recommendation was added for this finding."}
            </p>
          </Card>

          <Card className="p-6">
            <SectionHeader
              title="Evidence"
              description="Screenshots and annotations shared by your consultant."
            />

            {(images ?? []).length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No evidence shared yet
                </p>
              </div>
            ) : (
              <ReadOnlyEvidenceGallery
                images={images ?? []}
                annotations={annotations ?? []}
              />
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ReadOnlyEvidenceGallery({
  images,
  annotations,
}: {
  images: any[];
  annotations: any[];
}) {
  return (
    <div className="mt-5 space-y-5">
      {images.map((image, imageIndex) => {
        const imageAnnotations = annotations.filter(
          (annotation) =>
            annotation.image_id === image.id ||
            annotation.evidence_image_id === image.id
        );

        return (
          <div
            key={image.id || imageIndex}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-sm font-semibold text-slate-950">
                {image.evidence_name || image.caption || `Evidence ${imageIndex + 1}`}
              </p>
              {image.caption && image.evidence_name && (
                <p className="mt-1 text-xs text-slate-500">{image.caption}</p>
              )}
            </div>

            <div className="p-5">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={image.image_url || image.url || image.public_url}
                  alt=""
                  className="w-full object-contain"
                />

                {imageAnnotations.map((annotation, annotationIndex) => {
                  const label = annotation.label || String(annotationIndex + 1);

                  return (
                    <span
                      key={annotation.id || `${image.id}-${annotationIndex}`}
                      className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-xs font-bold text-white shadow-md"
                      style={{
                        left: `${annotation.x_position ?? 0}%`,
                        top: `${annotation.y_position ?? 0}%`,
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>

              {imageAnnotations.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Annotation notes
                  </p>
                  <div className="mt-3 space-y-2">
                    {imageAnnotations.map((annotation, annotationIndex) => {
                      const label = annotation.label || String(annotationIndex + 1);
                      const note = annotation.note || annotation.text;

                      if (!note) return null;

                      return (
                        <p
                          key={annotation.id || `note-${annotationIndex}`}
                          className="text-sm leading-6 text-slate-600"
                        >
                          <span className="font-semibold text-slate-950">
                            {label}.
                          </span>{" "}
                          {note}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

async function loadLinkedRecommendation({
  userId,
  savedRecommendationId,
  frameworkRecommendationId,
}: {
  userId: string;
  savedRecommendationId?: string | null;
  frameworkRecommendationId?: string | null;
}) {
  if (savedRecommendationId) {
    const { data } = await supabaseAdmin
      .from("studio_recommendations")
      .select("id,title,category,recommendation,impact")
      .eq("id", savedRecommendationId)
      .eq("user_id", userId)
      .maybeSingle();

    return data;
  }

  if (frameworkRecommendationId) {
    const { data } = await supabaseAdmin
      .from("studio_framework_recommendations")
      .select("id,title,category,recommendation,impact")
      .eq("id", frameworkRecommendationId)
      .eq("user_id", userId)
      .maybeSingle();

    return data;
  }

  return null;
}
