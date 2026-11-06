import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DELETE_CONFIRMATION = "DELETE AUDITFLOW";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const confirmation = String(body?.confirmation || "").trim();

  if (confirmation !== DELETE_CONFIRMATION) {
    return NextResponse.json(
      { error: `Type ${DELETE_CONFIRMATION} to confirm account deletion.` },
      { status: 400 }
    );
  }

  try {
    await deleteWorkspaceData(user.id);

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      return NextResponse.json(
        { error: deleteUserError.message || "Workspace data was deleted, but the auth user could not be removed." },
        { status: 500 }
      );
    }


    return NextResponse.json({
      ok: true,
      accountDeleted: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to delete account." },
      { status: 500 }
    );
  }
}

async function deleteWorkspaceData(userId: string) {
  const { data: imageRows } = await supabaseAdmin
    .from("finding_images")
    .select("image_url")
    .eq("user_id", userId);

  await removeStorageObjects(imageRows ?? []);

  const userScopedTables = [
    "notifications",
    "finding_comments",
    "image_annotations",
    "finding_images",
    "findings",
    "journey_steps",
    "journeys",
    "report_exports",
    "public_reports",
    "client_branding",
    "studio_framework_report_defaults",
    "studio_framework_recommendations",
    "studio_framework_journey_stages",
    "studio_framework_categories",
    "studio_frameworks",
    "studio_recommendations",
    "report_branding",
    "support_requests",
    "projects",
    "clients",
    "subscriptions",
  ];

  for (const table of userScopedTables) {
    const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);

    if (error) {
      throw new Error(`Unable to delete ${table}: ${error.message}`);
    }
  }
}

async function removeStorageObjects(
  imageRows: Array<{ image_url?: string | null }>
) {
  const candidatePaths = imageRows
    .map((row) => getStoragePathFromPublicUrl(row.image_url))
    .filter((value): value is string => Boolean(value && !value.startsWith("http")));

  const uniquePaths = Array.from(new Set(candidatePaths));

  if (!uniquePaths.length) return;

  await supabaseAdmin.storage.from("finding-images").remove(uniquePaths).catch((error) => {
    console.warn("Unable to remove some finding image storage objects.", error);
  });
}

function getStoragePathFromPublicUrl(value?: string | null) {
  if (!value || !value.includes("/storage/v1/object/public/finding-images/")) return null;

  return value.split("/storage/v1/object/public/finding-images/")[1] || null;
}
