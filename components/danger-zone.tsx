"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DELETE_CONFIRMATION = "DELETE AUDITFLOW";

export function DangerZone({
  accountEmail,
  currentPlan,
  hasActiveSubscription,
}: {
  accountEmail: string;
  currentPlan: string;
  hasActiveSubscription: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [confirmation, setConfirmation] = useState("");
  const [isSigningOutEverywhere, setIsSigningOutEverywhere] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canDelete = confirmation.trim() === DELETE_CONFIRMATION;

  async function signOutEverywhere() {
    setIsSigningOutEverywhere(true);

    const { error } = await supabase.auth.signOut({ scope: "global" });

    setIsSigningOutEverywhere(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("You have been signed out on all devices.");
    setSignOutDialogOpen(false);
    router.push("/login");
    router.refresh();
  }

  async function deleteAccount() {
    if (!canDelete) {
      toast.error(`Type ${DELETE_CONFIRMATION} to confirm account deletion.`);
      return;
    }

    setIsDeleting(true);

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });

    const result = await response.json().catch(() => null);

    setIsDeleting(false);

    if (!response.ok) {
      toast.error(result?.error || "Unable to delete account.");
      return;
    }

    toast.success("Your AuditFlow account has been deleted.");
    setDeleteDialogOpen(false);
    router.push("/goodbye");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-red-950">Danger zone</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-700">
            Permanently remove access or delete your AuditFlow account. These actions
            are sensitive, so deletion requires confirmation.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700">
          {currentPlan} plan
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-red-100 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Sign out all devices</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                End active sessions across browsers and devices. You can sign back in anytime.
              </p>
            </div>
            <Dialog open={signOutDialogOpen} onOpenChange={(open) => !isSigningOutEverywhere && setSignOutDialogOpen(open)}>
              <Button type="button" variant="outline" onClick={() => setSignOutDialogOpen(true)}>
                Sign out everywhere
              </Button>

              <DialogContent className="max-w-md p-0" showCloseButton={!isSigningOutEverywhere}>
                <div className="p-6">
                  <DialogHeader>
                    <DialogTitle>Sign out all devices?</DialogTitle>
                    <DialogDescription>
                      This will end active AuditFlow sessions across browsers and devices. You can sign back in anytime.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <DialogFooter className="mx-0 mb-0 rounded-b-xl border-t border-slate-200 bg-slate-50 p-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSigningOutEverywhere}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={signOutEverywhere} disabled={isSigningOutEverywhere}>
                    {isSigningOutEverywhere ? "Signing out..." : "Sign out all devices"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-red-950">Delete account</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This permanently deletes your account and workspace data, including projects,
            findings, evidence, annotations, journeys, reports, clients, recommendations,
            comments, notifications, and client portal links.
          </p>

          {hasActiveSubscription ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
              Your active subscription will be cancelled before your account is deleted.
              AuditFlow will email {accountEmail || "the account holder"} when the subscription
              cancellation and account deletion are completed.
            </p>
          ) : (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
              AuditFlow will email {accountEmail || "the account holder"} when account deletion is completed.
            </p>
          )}

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">
              Type <span className="font-bold text-red-700">{DELETE_CONFIRMATION}</span> to confirm
            </span>
            <Input
              className="mt-2 h-11 rounded-xl bg-white px-3"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={DELETE_CONFIRMATION}
              autoComplete="off"
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              This action cannot be undone. Cancel from Stripe and account deletion emails are sent automatically when configured.
            </p>
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={!canDelete || isDeleting}
              >
                Delete account
              </Button>

              <DialogContent className="max-w-lg p-0" showCloseButton={!isDeleting}>
                <div className="p-6">
                  <DialogHeader>
                    <DialogTitle>Delete your account?</DialogTitle>
                    <DialogDescription asChild>
                      <div className="space-y-3 text-sm leading-6 text-slate-600">
                        <p>
                          This action permanently deletes your AuditFlow account and all associated data.
                        </p>
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Projects, findings, journeys, and reports</li>
                          <li>Evidence, annotations, and uploaded files</li>
                          <li>Recommendations, frameworks, and settings</li>
                          <li>Client workspaces, comments, and portal links</li>
                        </ul>
                        {hasActiveSubscription ? (
                          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                            Your active subscription will be cancelled before your account is deleted.
                          </p>
                        ) : null}
                        <p className="font-medium text-red-700">This cannot be undone.</p>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <DialogFooter className="mx-0 mb-0 rounded-b-xl border-t border-slate-200 bg-slate-50 p-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isDeleting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={deleteAccount}
                    disabled={!canDelete || isDeleting}
                  >
                    {isDeleting ? "Deleting account..." : "Delete account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}
