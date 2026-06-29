"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";

type RecommendationOption = {
  id: string;
  title: string;
  category: string | null;
  recommendation: string;
  impact: string | null;
  source: "library" | "framework";
};

export function RecommendationPicker({
  recommendations,
  onApply,
}: {
  recommendations: RecommendationOption[];
  onApply: (recommendation: RecommendationOption) => void;
}) {
  const [selectedId, setSelectedId] = useState("");

  const selected = useMemo(
    () => recommendations.find((item) => item.id === selectedId),
    [recommendations, selectedId]
  );

  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex-1">
          <span className="text-sm font-semibold text-violet-900">Use saved recommendation</span>
          <SelectInput
            className="mt-2 bg-white"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select a recommendation</option>
            {recommendations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} {item.source === "framework" ? "(Framework)" : "(Library)"}
              </option>
            ))}
          </SelectInput>
        </label>

        <Button
          type="button"
          variant="outline"
          disabled={!selected}
          onClick={() => selected && onApply(selected)}
        >
          Insert
        </Button>
      </div>

      {selected && (
        <p className="mt-3 text-sm leading-6 text-violet-800">
          {selected.recommendation}
        </p>
      )}
    </div>
  );
}

export type { RecommendationOption };
