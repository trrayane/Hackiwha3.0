
import { StatusBadge } from "./Statusbadge";
import type { Jingle } from "../types";

export interface JinglesTableProps {
  title?: string;
  jingles: Jingle[];
  /** Called when "View all generated sounds" is clicked */
  onViewAll?: () => void;
}

/**
 * JinglesTable
 * Card containing the "Latest Jingles" table: name, platform, feedback
 * score, status badge, and duration, with a footer "view all" action.
 */
export default function JinglesTable({
  title = "Latest Jingles",
  jingles,
  onViewAll,
}: JinglesTableProps){
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200 bg-white text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Jingle</th>
              <th className="px-6 py-4 font-medium">Platform</th>
              <th className="px-6 py-4 font-medium">Feedback</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {jingles.map((jingle) => (
              <tr key={jingle.id}>
                <td className="px-6 py-4">{jingle.name}</td>
                <td className="px-6 py-4">{jingle.platform}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {jingle.feedback}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={jingle.status} />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {jingle.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 bg-white px-6 py-4 text-center">
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          View all generated sounds
        </button>
      </div>
    </div>
  );
}