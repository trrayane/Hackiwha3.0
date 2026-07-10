import React from "react";
import type { JingleStatus } from "../types";

const STATUS_STYLES: Record<JingleStatus, string> = {
  Approved: "bg-[#dcfce7] text-green-700",
  "In Review": "bg-[#fee2e2] text-red-700",
  Draft: "bg-gray-100 text-gray-600",
};

export interface StatusBadgeProps {
  status: JingleStatus;
}

/**
 * StatusBadge
 * Small pill showing a jingle's review status, colored by state.
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-md px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}